import DS from 'ember-data';
import ArrayProxy, { A } from '@ember/array';
import { Promise } from 'rsvp';
import { get } from '@ember/object';
import { run } from '@ember/runloop';
import { instrument } from 'ember-data/-debug';
import { warn, deprecate } from '@ember/debug';
import config from '../../config/environment';
import createUuidBasedOnNamespace from '../utils/utils';
import { DisconnectedError, TimeoutError, ServerError, InvalidError, AdapterError } from './errors';

const SocketAdapter = DS.Adapter.extend({

  defaultSerializer: "-socket",

  socket: Ember.inject.service('socket-io'),
  defaultSocket: this.get('socket').socketFor(config.socket.host + config.socket.defaultNamespace),
  socketDef: this.get('socket').socketFor(config.socket.host + config.socket.defNamespace),

  /**
    * the `type` refers to entity type
    * @param {Element} type
    */
  _commandBuilder(operation, type) {
    return operation + "/" + type;
  },

  /**
   * Binds all the socket.io-events regex commands to an EventEmitter
   * @param {EventEmitter} socket
   * @param {Object} options
   */
  _bindRequestToSocket(socket, options) {
    if(!options.hasOwnProperty("requestData")) {
      options['requestData'] = null;
    }
    let { command } = options;
    let controller = this.getController(command);
    options['controller'] = controller;
    
    socket.on('error', socketError.call(this, socket, options));
    
    options['error_class'] = DisconnectedError;
    socket.on('connect_error', socketError.call(this, socket, options));
    
    options['error_class'] = TimeoutError;
    socket.on('connect_timeout', socketError.call(this, socket, options));
    
    options['error_class'] = DisconnectedError;
    socket.on('reconnect_error', socketError.call(this, socket, options));

    options['error_class'] = ServerError;
    socket.on('reconnect_failed', socketError.call(this, socket, options));
    
    socket.on(command + "/success", socketSuccess.call(this, socket, options));
  },

  /**
   * Removes all event listeners from the EventEmitter
   * @param {EventEmitter} socket
   * @param {String} command
   */
  _removeAllBindings(socket, command) {
    socket.removeAllListeners('error');
    socket.removeAllListeners('connect_error');
    socket.removeAllListeners('connect_timeout');
    socket.removeAllListeners('reconnect_error');
    socket.removeAllListeners('reconnect_failed');
    socket.removeAllListeners(command + "/success");
  },

  /**
   * Error handler that creates Adapter-specific errors
   * @param {Object} errorClass
   * @param {Function} errorObject
   */
  _errorHandler(errorClass, errorObject) {
    if(errorClass == TimeoutError) {
      var errors = A([
        {
          title: 'Timeout Error',
          detail: 'Adapter timedout'
        }
      ]);
      errors.pushObjects(errorObject.errors);
      return new TimeoutError(errors.toArray());
    } else if(errorClass == ServerError) {
      var errors = A([
        {
          title: 'Server Error',
          detail: 'Adapter could not process request'
        }
      ]);
      errors.pushObjects(errorObject.errors);
      return new ServerError(errors.toArray());
    } else if(errorClass == DisconnectedError) {
      var errors = A([
        {
          title: 'Disconnected Error',
          detail: 'Socket disconnected'
        }
      ]);
      errors.pushObjects(errorObject.errors);
      return new DisconnectedError(errors.toArray());
    } else {
      var errors = A([
        {
          title: 'Adapter Error',
          detail: 'Adapter failed'
        }
      ]);
      errors.pushObjects(errorObject.errors);
      return new AdapterError(errors.toArray());
    }
  },

  /**
   * Returns response for successful execution
   * @param {EventEmitter} socket
   * @param {Object} data
   */
  handleResponse(socket, data) {
    // defined in controller as well
  },

  /**
   * Returns the recent error that has been registered
   * @param {EventEmitter} socket
   * @param {Object} requestData
   * @param {Object} errorObject
   * @param {Function} errorClass
   */
  handleError(socket, requestData, errorObject, errorClass) {
    // defined in controller as well
    let error = this._errorHandler(errorClass, errorObject);
    return error.errors[error.errors.length - 1];
  },

  /**
   * Returns the Entity Controller instance
   * @param {String} command
   */
  getController(command) {
    return this.get('registry').getController(command).create({
      'adapter': this
    });
  },

  /**
    * inputProperties has a property called `type` which refers to category of the entity type
    * @param {Object} inputProperties
    */
  generateIdForRecord(store, inputProperties) {
    if(createUuidBasedOnNamespace) {
        return createUuidBasedOnNamespace(inputProperties);
    }
    return null;
  },

  /**
   * API specification same as JSONAdapter
   * @param {DS.Store} store
   * @param {String} type
   * @param {Object} query
   */
  query(store, type, query) {
    const operation = 'read';
    var command = this._commandBuilder(operation, type);

    return new Promise(function(resolve, reject) {
      this._removeAllBindings(this.get('defaultSocket'), command);
      this._bindRequestToSocket(this.get('defaultSocket'), {
        resolve: resolve, 
        reject: reject,
        command: command,
        request_data: query
      });
      socket = this.get('defaultSocket').emit(command, query, function() {});
    });
  },

  /**
   * Finds a single record from the database
   * @param {DS.Store} store
   * @param {String} type
   * @param {String} id
   * @param {DS.Snapshot} snapshot
   */
  findRecord(store, type, id, snapshot) {
    // id derived from the internal model
    const operation = 'read';
    var command = this._commandBuilder(operation, type);
    var requestData = {};
    // snapshot.id is uuid that is pushed from the client
    // snapshot.attr('id') points to the primaryKey of the model in the database
    if(snapshot && snapshot.attr('id')) {
      requestData['id'] = snapshot.attr('id');
    } else if((snapshot && snapshot.id) || id) {
      requestData['uuid'] = snapshot.id || id;
    }

    return new Promise(function(resolve, reject) {
      this._removeAllBindings(this.get('defaultSocket'), command);
      this._bindRequestToSocket(this.get('defaultSocket'), {
        resolve: resolve, 
        reject: reject,
        command: command,
        request_data: requestData
      });
      socket = this.get('defaultSocket').emit(command, query, function() {});
    });
  },

  /**
   * Finds all record based on the parameters
   * @param {DS.Store} store
   * @param {String} type
   * @param {String} sinceToken
   * @param {DS.RecordArray} snapshotRecordArray
   */
  findAll(store, type, sinceToken, snapshotRecordArray) {
    const operation = 'read';
    var command = this._commandBuilder(operation, type);
    // sinceToken is used to query historical data
    if(sinceToken) {
      requestData.since = sinceToken;
    }
    if(snapshotRecordArray.include) {
      requestData.include = snapshotRecordArray.include;
    }

    return new Promise(function(resolve, reject) {
      this._removeAllBindings(this.get('defaultSocket'), command);
      this._bindRequestToSocket(this.get('defaultSocket'), {
        resolve: resolve, 
        reject: reject,
        command: command,
        request_data: requestData
      });
      socket = this.get('defaultSocket').emit(command, query, function() {});
    });
  },

  /**
   * Queries single record based on recent updates
   */
  queryRecord(store, type, query) {
    const operation = 'read';
    var command = this._commandBuilder(operation, type);
    if(query.hasOwnProperty('updatedAt') && query.updatedAt) {
      requestData.updatedAt = query.updatedAt;
    }

    return new Promise(function(resolve, reject) {
      this._removeAllBindings(this.get('defaultSocket'), command);
      this._bindRequestToSocket(this.get('defaultSocket'), {
        resolve: resolve, 
        reject: reject,
        command: command,
        request_data: requestData
      });
      socket = this.get('defaultSocket').emit(command, query, function() {});
    });
  },

  /**
   * Creates a record
   * @param {DS.Store} store
   * @param {String} type
   * @param {DS.Snapshot} snapshot
   */
  createRecord(store, type, snapshot) {
    const operation = 'create';
    let data = this.serialize(snapshot, { incldeId: true });
    var command = this._commandBuilder(operation, type);
    if(snapshot.id) {
      requestData = { "data": data }
    }

    return new Promise(function(resolve, reject) {
      this._removeAllBindings(this.get('socketDef'), command);
      this._bindRequestToSocket(this.get('socketDef'), {
        resolve: resolve, 
        reject: reject,
        command: command,
        request_data: requestData
      });
      socket = this.get('socketDef').emit(command, query, function() {});
    });
  },

  /**
   * Updates the record
   * @param {DS.Store} store
   * @param {String} type
   * @param {DS.Snapshot} snapshot
   */
  updateRecord(store, type, snapshot) {
    const operation = 'update';
    let data = this.serialize(snapshot, { includeId: true });
    let uuid = snapshot.id;
    var command = this._commandBuilder(operation, type + "/" + uuid);
    if(snapshot.id) {
      requestData = { "data": data }
    }

    return new Promise(function(resolve, reject) {
      this._removeAllBindings(this.get('socketDef'), command);
      this._bindRequestToSocket(this.get('socketDef'), {
        resolve: resolve, 
        reject: reject,
        command: command,
        request_data: requestData
      });
      socket = this.get('socketDef').emit(command, query, function() {});
    });
  },

  /**
   * Deletes a record
   * @param {DS.Store} store
   * @param {String} type
   * @param {DS.Snapshot} snapshot
   */
  deleteRecord(store, type, snapshot) {
    const operation = 'delete';
    let data = this.serialize(snapshot, { includeId: true });
    let uuid = snapshot.id;
    var command = this._commandBuilder(operation, type + "/" + uuid);
    if(snapshot.id) {
      requestData = { "data": data }
    }

    return new Promise(function(resolve, reject) {
      this._removeAllBindings(this.get('socketDef'), command);
      this._bindRequestToSocket(this.get('socketDef'), {
        resolve: resolve, 
        reject: reject,
        command: command,
        request_data: requestData
      });
      socket = this.get('socketDef').emit(command, query, function() {});
    });
  },

  /**
   * Finds many records based on supplied ids
   * @param {Array} ids
   * @param {Array} snapshots
   */
  findMany(store, type, ids, snapshots) {
    const operation = 'read';
    var command = this._commandBuilder(operation, type);
    var requestData = {};
    if(ids.length > 0) {
      requestData["filter"] = { uuid: ids.join(',')};
    } else if(snapshots.length > 0) {
      requestData["filter"] = { id: [] };
      for(var i=0; i < snapshots.length; i++) {
        requestData["filter"]["id"].append(snapshots.attr('id'));
      }
    }

    return new Promise(function(resolve, reject) {
      this._removeAllBindings(this.get('socketDef'), command);
      this._bindRequestToSocket(this.get('socketDef'), {
        resolve: resolve, 
        reject: reject,
        command: command,
        request_data: requestData
      });
      socket = this.get('socketDef').emit(command, query, function() {});
    });
  }

});

/**
 * Error handler for the socket errors
 * @param {EventEmitter} socket
 * @param {Object} options
 */
function socketError(socket, options) {
  let adapter = this;
  let { requestData, errorClass, controller, reject } = options;
  errorClass = errorClass || AdapterError;
  return function(errorObject) {
    let errorResponse;
    try {
      errorResponse = controller.handleError(socket, requestData, errorObject, errorClass);
    } catch(error) {
      return Promise.reject(error);
    }

    if(errorResponse && errorResponse.isAdapterError) {
      return Promise.reject(errorResponse);
    } else {
      run.join(null, reject, errorResponse);
      return errorResponse;
    }
  };

};

/**
 * Event handler for the successful socket events
 * @param {EventEmitter} socket
 * @param {Object} options
 */
function socketSuccess(socket, options) {
  let adapter = this;
  let { requestData, controller, resolve, command } = options;
  return function(data) {
    let response;
    try {
      // the success handler connects with a component to respond to success event
      response = controller.handleResponse(socket, command, data);
    } catch(error) {
      return Promise.reject(error);
    }

    if(response && response.isAdapterError) {
      return Promise.reject(response);
    } else {
      run.join(null, resolve, response);
      return response;
    }
  }
};

export default SocketAdapter;
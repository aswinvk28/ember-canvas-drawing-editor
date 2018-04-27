import Ember from 'ember';
import { InvalidError, ValidationError } from '../adapters/errors';

export const DefaultController = Ember.Controller.extend({
  /**
   * Error handle for the entity controller
   * @param {Object} errorObject
   */
  _errorhandler(errorObject) {
    if(errorObject instanceof InvalidError) {
      var errors = A([
        {
          title: 'Invalid Error',
          detail: 'Data does not exist error'
        }
      ]);
      // data type error
      errors = errors.pushObjects(errorObject.errors);
      return new InvalidError(errors.toArray());
    } else {
      var errors = A([
        {
          title: 'Validation Error',
          detail: 'Data validation error'
        }
      ]);
      // data type error, validation error
      errors = errors.pushObjects(errorObject.errors);
      return new ValidationError(errors.toArray());
    }
    return null;
  },
  
  /**
   * Response handler
   * @param {EventEmitter} socket
   * @param {Object} data
   */
  handleResponse(socket, data) {
    // implementation
    
    this.get('adapter').apply(this, arguments);
  },

  /**
   * Error handler
   * @param {EventEmitter} socket
   * @param {Object} requestData
   * @param {Object} errorObject
   * @param {Function} errorClass
   */
  handleError(socket, requestData, errorObject, errorClass) {
    let error = this._errorHandler(errorObject);
    let adapterError = this.get('adapter').apply(this, arguments);
    if(error.errors.length > 0) {
      return error.errors[error.errors.length - 1];
    }
    return adapterError.errors[adapterError.errors.length - 1];
  },
});
import EmberObject from '@ember/object';
import { capitalize, camelize } from '@ember/string';

const EntitySubscriber = EmberObject.extend({

  event_emitter: new EventEmitter(),

  parameters: Object.create(),

  /**
   * @param {String} key
   */
  clear(key) {
    if(this.get('parameters').hasOwnProperty(key)) {
      delete this.get('parameters')[key];
      return true;
    }
    return false;
  },

  clearAll() {
    this.get('parameters') = Object.create();
  },
  
  subscribe(eventName, listener) {
    this.get('event_emitter').on(evntname, listener);
  },

  /**
   * @param {String} eventName
   * @param {Function} listener
   */
  unsubscribe(eventName, listener) {
    this.get('event_emitter').removeListener(eventName, listener);
  },

  /**
   * @param {String} eventName
   */
  removeAll(eventName) {
    if(eventname == undefined) {
      this.get('event_emitter').removeAllListeners();
    } else {
      this.get('event_emitter').removeAllListeners(eventName);
    }
  },

  /**
   * @param {String} eventName
   */
  trigger(eventName) {
    var args = arguments.slice(1);
    this.get('event_emitter').emit(eventName, args, this);
  },

  /**
   * @param {String} eventName
   * @param {Function} listener
   */
  subscribeOnce(eventName, listener) {
    this.get('event_emitter').once(eventName, listener);
  }

});

export function initialize(application) {
  application.register('subscriber:entity', EntitySubscriber);
  application.inject('controller', 'subscriber', 'subscriber:entity');
}

export default { 
  name: 'subscriber',
  initialize: initialize
};

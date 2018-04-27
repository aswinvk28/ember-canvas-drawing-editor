import EmberObject from '@ember/object';
import * as Controller from '../controllers/entity-controller';
import { capitalize, camelize } from '@ember/string';

const EntityRegister = EmberObject.extend({
  /**
   * @param {String} command
   */
  _resolveCommand(command) {
    var result = command.split('/');
    return {
      'operation': result[0],
      'type': result[1]
    };
  },

  /**
   * @param {String} command
   */
  getController(command) {
    [operation, type] = this._resolveCommand(command);
    var controllerName = (type + "Controller").capitalize();
    if(Controller.hasOwnProperty(controllerName)) {
      return Controller[controllerName];
    }
    return Controller.DefaultController;
  }
});

export function initialize(application) {
  application.register('controller:entity', EntityRegister);
  application.inject('adapter', 'registry', 'controller:entity');
}

export default { initialize };

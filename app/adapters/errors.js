import { extend } from '@ember/object';
import EmberError from '@ember/error';
export { InvalidError, TimeoutError, ServerError, AdapterError } from 'ember-data';

export const DisconnectedError = extend(AdapterError, 'Socket disconnected from server');

export function ValidationError(errors, message = 'Validation error') {
  this.isValidationError = true;
  EmberError.call(this, message);

  this.errors = errors || [
    {
      title: 'Validation Error',
      detail: message
    }
  ];
};
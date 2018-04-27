import { v5 } from 'uuid';

export default function getNamespace(type) {
  return "ns:" + type + "/";
};

export default function getElement(name, id) {
  return name + "/" + id;
};

export default function createUuidBasedOnNamespace(properties) {
  if(properties.hasOwnProperty('primaryKey')) {
    var identifier = properties.name + "/" + properties.primaryKey;
    var namespace = "ns:" + properties.type + "/"
    return v5(identifier, namespace)
  }
  return null;
};
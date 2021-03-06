/*
  Model class
*/

import Record from './record';
import {Relation} from './relations';
import {each} from './util';

export default class Model {

  constructor(name, opts, props) {
    /*
      @opts {@url, @schema}
    */
    this.name = name;
    this.url = this.validateUrl(opts.url);
    this.schema = this.validateSchema(opts.schema);
    this.RecordClass = opts.RecordClass;
    this.props = props;
  }

  hasManyAttrs() {
    return Object.keys(this.schema).filter(
      key => this.schema[key].type === 'hasMany'
    );
  }

  validateUrl(url) {
    if (url === undefined)
      return '/' + this.name + '/';
    // url must begin and end with a slash.
    let first = url[0];
    let last = url[url.length-1];
    if (first === '/' && last === '/')
      return url;
    throw new Error('@url must begin and end with a forward slash.');
  }

  validateSchema(schema={}) {
    Object.keys(schema).forEach((key) => {
      if (!(schema[key] instanceof Relation))
        throw new Error('Schema relation must be of type Relation.');
    });
    return schema;
  }

  create(state) {
    let defaults = {};
    each(this.schema, (val, key) => {
      if (val.defaultValue !== undefined) {
        if (typeof val.defaultValue === 'function')
          defaults[key] = val.defaultValue(state);
        else
          defaults[key] = val.defaultValue;
      }
    });
    state = Object.assign(defaults, state);
    let RecordClass = this.RecordClass || Record;
    return new RecordClass(state, {
      model: this,
      store: this.props.store
    });
  }

}

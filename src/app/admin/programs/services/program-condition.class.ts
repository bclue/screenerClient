import { ProgramCondition, ProgramQuery, Key } from '../../models'
import { FormGroup, FormBuilder, AbstractControl, Validators, FormControl, FormArray } from '@angular/forms';
import { UserProgram } from './user-program.class';

export class ProgramConditionClass {
  data: ProgramCondition;
  form: FormGroup;

  constructor(fb: FormBuilder, opts?){

    this.data = opts ? opts : {
      key: {
        name: 'invalid',
        type: 'invalid'
      },
      value: 'invalid',
      type: 'invalid',
      qualifier: 'invalid'
    };
    this._initForm(fb);
  }

  private _initForm(fb: FormBuilder) {
    this.form = fb.group({
      key: fb.group({
        name: new FormControl(this.data.key.name, Validators.required),
        type: new FormControl(this.data.key.type, Validators.required)
      }),
      value: new FormControl(this.data.value, Validators.required),
      type: new FormControl(this.data.type),
      qualifier: new FormControl(this.data.qualifier)
    }, {validator: this.validator})
  }

  validator(condition: AbstractControl): {[key: string]: any} {
    const value = condition.value;
    const key: Key = value.key;
    const others = Object.keys(value).filter(k => k !== 'key')
    const errors = {};

    if (key.name === 'invalid' || key.type === 'invalid') {
      errors['invalid_key'] = 'key is invalid';
      condition.get('key').setErrors(errors);
    }

    others.forEach(prop => {
      if(value[prop] === 'invalid')
        errors[prop] = 'invalid'
    })

    if (Object.keys(errors).length > 0)
      return errors;

    return null;
  }

  hashedValue(): string {
    return JSON.stringify(this.data);
  }
}

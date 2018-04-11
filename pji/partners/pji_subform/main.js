import mainStyle from '@lib/styles/style.important.styl';
import {
    SailPlay
} from '@lib/core.js'
import ko from 'knockout';
import 'knockout.validation';
import $ from 'jquery';
import "babel-polyfill";
require('@lib/styles/helpers.important.styl');
require('@lib/jquery-ui._autocomplete.js');
require('@lib/jquery-ui.min.css');

import mainTemplate from './main.pug';
require('./assets/styles/style.native.styl')
require('./assets/styles/style.important.styl')

let initiated = false;

window.ko = ko

window.SAILPLAY = function (opts) {
    if (initiated) return;
    initiated = true;
    let sp = new SailPlay({
        // auth_hash: auth_hash,
        domain: opts.domain || 'http://sailplay.ru',
        language: opts.language || 'en',
        partner_id: opts.partner || 1491
    })

    class PJI_Subform {
        constructor() {
            this.mainFields = ko.observableArray(),
            this.secondaryFields = ko.observableArray(),

            this.padding_on = ko.observable();

            this.in_progress = ko.observable(false),

            this.sms_opt = ko.observable(false),
            this.email_opt = ko.observable(false),

            this.sms_opt_text = ko.observable(),
            this.email_opt_text = ko.observable(),

            this.gender_male = ko.observable(),
            this.gender_female = ko.observable(),

            this.opt_out_description = ko.observable(),
            this.legal_text_html = ko.observable(),

            this.email = ko.observable(),
            this.step = ko.observable(1),
            this.last_step = ko.observable(),
            this.congrat = ko.observable(false),

            this.btn_text = ko.observable(),
            this.user_agreement_line_1 = ko.observable(),
            this.user_agreement_line_2 = ko.observable(),
            this.user_agreement_link = ko.observable(),
            this.user_agreement_link_href = ko.observable(),

            this.title = ko.observable(),
            this.title_step_1 = ko.observable(),
            this.title_step_2 = ko.observable(),

            this.thank_title = ko.observable(),
            this.thank_description = ko.observable(),
            this.thank_button = ko.observable(),
            this.thank_image = ko.observable(''),
            this.thank_link_href = ko.observable(),

            this.second_step_submit = ko.observable();
            this.allow_edit = ko.observable();

            this.day_input_size = ko.observable();
            this.month_input_size = ko.observable();
            this.year_input_size = ko.observable();

            this.day_text = this.month_text = this.year_text = ''

            this.check_email_opt_out_visible = ko.computed(() => {
                let visible = true;

                if (!sp.specificConfig.settings.email_opt) visible = false;
                if (sp.specificConfig.settings.reg_on_last_step && !this.last_step()) visible = false;
                if (!sp.specificConfig.settings.reg_on_last_step && this.last_step()) visible = false;

                return visible;
            })

            this.check_sms_opt_out_visible = ko.computed(() => {
                let visible = true;

                if (!sp.specificConfig.settings.sms_opt) visible = false;
                if (sp.specificConfig.settings.reg_on_last_step && !this.last_step()) visible = false;
                if (!sp.specificConfig.settings.reg_on_last_step && this.last_step()) visible = false;

                return visible;
            })

            this.submit_available = ko.computed(() => {
                let available = true;
                if (sp.specificConfig.settings.email_opt &&
                    (this.last_step() || !sp.specificConfig.settings.reg_on_last_step))
                    available = this.email_opt()

                return available;
            })

            this.to_legal = function(){
                $('html, body').animate({
                    scrollTop: $('.__sailplay-legal-text').offset().top
                })
            }

            this.superscripts = ko.observable();
        }

        getData(field_set) {
            let data = {};
            ko.utils.arrayForEach(this[field_set](), chunk => {
                for (let f of chunk) {
                    if ((f.type == 'birthday' || f.type == 'sign_up_date') && f.day() != 'Day' && f.month().id && f.year() != 'Year') {
                        data[f.type] = `${f.year()}-${("0" + f.month().id).slice(-2)}-${("0" + f.day()).slice(-2)}`
                    }
                    else if (f.type == 'phone') {
                        let value = f.value();
                        data[f.type] = getPhoneValue({
                            value: value ? value.slice(f.slice || 0) : '',
                            maskMaxLength: f.maskMaxLength,
                            countryCode: f.countryCode,
                        });
                    }
                    else {
                        data[f.type] = f.value();
                    }
                }
            })
            return data
        }

        submit() {
            setTimeout(() => this.in_progress(true));

            let self = this;
            let valid = true;
            let field_set = this.step() == 1 ? 'mainFields' : 'secondaryFields'

            this.email_opt.isModified(true);
            if (valid)
                this.email_opt.isValid();

            ko.utils.arrayForEach(this[field_set](), chunk => {
                for (let f of chunk) {
                    if (f.value.isModified) {
                        f.value.isModified(true)
                        if (valid)
                            valid = f.value.isValid()
                    }
                }
            })

            if (!valid) {
                setTimeout(() => this.in_progress(false));
                return
            }

            let data = this.getData(field_set);
            let _fields = this[field_set]();

            if (!this.email())
                this.email(data.email)

            function updateInfo() {
                let data_to_update = {
                    addPhone: data.phone,
                    firstName: data.first_name,
                    lastName: data.last_name,
                    sex: data.sex,
                    birthDate: data.birthday
                }

                if (self.allow_edit) {
                    let data_vars = {};
                    for (let key of Reflect.ownKeys(data)) {
                        switch (key) {
                            case 'phone':
                                if (data[key]) data_vars["__form_edit_['phone']"] = data[key];
                                break
                            case 'first_name':
                                if (data[key]) data_vars["__form_edit_['firstName']"] = data[key];
                                break
                            case 'last_name':
                                if (data[key]) data_vars["__form_edit_['lastName']"] = data[key];
                                break
                            case 'sex':
                                if (data[key]) data_vars["__form_edit_['sex']"] = data[key];
                                break
                            case 'birthday':
                                if (data[key]) data_vars["__form_edit_['birthDate']"] = data[key];
                                break
                            default:
                                let isVariable = ko.utils.arrayFirst(_fields, chunk => ko.utils.arrayFirst(chunk, item => item.isVariable));
                                if (isVariable) data_vars[key] = data[key] || '';
                                break;
                        }
                    }
                    sp.updateCustomVars({
                        email: self.email(),
                        ...data_vars
                    })
                }

                return sp.updateUserInfo($.extend(true, {
                    email: self.email()
                }, data_to_update))
            }

            function updateVars(empty) {
                if (empty) // нужно всегда иметь список кустом варов даже пустых
                    return sp.updateCustomVars({
                        email: self.email(),
                        'Registration Code': '',
                        'ID Number': '',
                        'Sign Up Date': '',
                        'Store': '',
                        'Street Address 1': '',
                        'Street Address 2': '',
                        'Zip Code': '',
                        'State': '',
                        'City': '',
                        'Region': ''
                    })

                let data_to_update = {
                    'Registration Code': data.reg_code,
                    'ID Number': data.id,
                    'Sign Up Date': data.sign_up_date,
                    'Store': data.store,
                    'Street Address 1': data.address_1,
                    'Street Address 2': data.address_2,
                    'Zip Code': data.zip,
                    'State': data.state,
                    'City': data.city,
                    'Region': data.region
                }

                return sp.updateCustomVars($.extend(true, {
                    email: self.email(),
                }, data_to_update))
            }

            function updateTagsArray(fieldGroupsArray) {
                var tagsArray = []
                $.each(data, (k, v) => {
                    fieldGroupsArray.forEach((fieldsGroupName) => {
                        pji_subform[fieldsGroupName]().forEach((fieldsGroup) => {
                            fieldsGroup.forEach(function (field) {
                                if (field.autocomplete && (field.type.toLowerCase() == k.toLowerCase())) {
                                    field.autocomplete.forEach((entry) => {
                                        if (v && (entry.name.toLowerCase() == v.toLowerCase()) && entry.tag) {
                                            tagsArray.push(entry.tag)
                                        }
                                    })
                                }
                            })
                        })
                    })
                })
                return tagsArray

            }

            function updateTags(fieldGroupsArray) {
                var tagsArray = updateTagsArray(fieldGroupsArray)
                if (tagsArray.length) {
                    sp.addTags(tagsArray, {
                        auth_hash: '',
                        email: self.email(),
                        phone: ''
                    })
                }
            }

            function updateSmsOpt() {
                var tagsAddArray = []
                var tagsDeleteArray = []

                if (self.sms_opt()) {
                    tagsAddArray.push('SMS Opt-In')
                    tagsDeleteArray.push('SMS Opt-Out')
                }
                else {
                    tagsAddArray.push('SMS Opt-Out')
                    tagsDeleteArray.push('SMS Opt-In')
                }

                if(tagsAddArray)
                    sp.addTags(tagsAddArray, {
                        auth_hash: '',
                        email: self.email(),
                        phone: ''
                    })
                if(tagsDeleteArray)
                    sp.removeTags(tagsDeleteArray, {
                        auth_hash: '',
                        email: self.email(),
                        phone: ''
                    })
            }

            function nextStep() {
                if ((sp.specificConfig.settings.steps || 1) > self.step()) {
                    self.step(self.step() + 1);
                    self.btn_text(sp.specificConfig.settings.texts.button_step_2)
                    self.last_step(true);
                    setTimeout(() => {
                        $('html, body').animate({
                            scrollTop: $('.__sailplay-step2').offset().top
                        })
                    }, 100)
                } else {
                    sp.addTags([self.second_step_submit()], {
                        auth_hash: '',
                        email: self.email(),
                        phone: ''
                    })

                    self.congrat(true)
                }

                setTimeout(() => self.in_progress(false))
            }

            if (sp.specificConfig.settings.reg_on_last_step && sp.specificConfig.settings.steps == 2) {
                if (this.last_step()) {
                    let tags = ['Marketing Opt-In'].concat(updateTagsArray(['mainFields', 'secondaryFields']))
                    data = $.extend(true, {}, this.previous_data, data)

                    sp.addTags(tags, {
                        auth_hash: '',
                        email: this.email(),
                        phone: ''
                    })
                        .then(updateVars(1))
                        .then(updateInfo)
                        .then(updateVars(0))
                        .then(updateSmsOpt)
                        .then(nextStep)

                    setTimeout(() => this.in_progress(false))
                    return
                } else {
                    this.previous_data = data;
                    nextStep();
                    setTimeout(() => this.in_progress(false))
                    return
                }
            }

            if (this.step() == 1) {
                let tags = ['Marketing Opt-In', 'Subscription form not finished'].concat(updateTagsArray(['mainFields']))
                sp.addTags(tags, {
                    auth_hash: '',
                    email: this.email(),
                    phone: ''
                })
                    .then(updateVars(2))
                    .then(updateInfo)
                    .then(updateVars(0))
                    .then(updateSmsOpt)
                    .then(nextStep)
            }

            if (this.step() == 2)
                sp.removeTags(['Subscription form not finished'], {
                    auth_hash: '',
                    email: this.email(),
                    phone: ''
                })
                    .then(updateVars(0))
                    .then(updateTags(['secondaryFields']))
                    .then(updateInfo)
                    .then(nextStep)

            this.in_progress(false);
        }
    }

    // --- utils

    ko.extenders.defaultIfNull = function (target, defaultValue) {
        var result = ko.computed({
            read: target,
            write: function (newValue) {
                if (!newValue) {
                    target(defaultValue);
                } else {
                    target(newValue);
                }
            }
        });

        result(target());

        return result;
    };

    // --- masked input

    ko.extenders.mask = function (observable, mask) {
        observable.mask = mask;
        return observable;
    };

    ko.extenders.maskMaxLength = function (observable, len) {
        observable.maxLen = len;
        return observable;
    }

    // ko.validation.rules['uniq_pattern'] = {
    //     validator: function (val, content) {
    //         let pattern = content[0];
    //         console.log(parr)
    //         console.log(val.match(new RegExp(pattern)))
    //         return val.match(pattern)
    //     },
    //     message: ko.validation.rules.pattern.message
    // }

    $.jMaskGlobals = {
        maskElements: 'input,td,span,div',
        dataMaskAttr: '*[data-mask]',
        dataMask: true,
        watchInterval: 300,
        watchInputs: true,
        watchDataMask: false,
        byPassKeys: [9, 16, 17, 18, 36, 37, 38, 39, 40, 91],
        translation: {
            // '0': {pattern: /\d/},
            // '9': {pattern: /\d/, optional: true},
            'm': { pattern: /^\d{1,11}$/ },
            '#': { pattern: /\d/, recursive: true },
            'd': { pattern: /\d/ },
            'A': { pattern: /[a-zA-Z0-9]/ },
            'S': { pattern: /[a-zA-Z]/ }
        }
    };

    let getPhoneValue = function ( { value, maskMaxLength, countryCode} ) {
        let phoneValue = value;
        if (maskMaxLength && countryCode && maskMaxLength >= value.split(/[\D]/).join('').length)
                phoneValue = countryCode + value;
        return phoneValue;
    }

    let origValueUpdate = ko.bindingHandlers.value.update;
    ko.bindingHandlers.value.update = function (element, valueAccessor) {
        let val = valueAccessor(),
            mask = val.mask,
            newValue = val();

        origValueUpdate.apply(this, arguments);

        if (mask) {
            if (newValue)
                newValue = newValue.split(/[\D]/).join('');

            let set_mask = (newValue && newValue.length > val.maxLen) ? 'ddddddddddd' : mask

            let options = {
                onChange: function(content) {
                    let set_mask = (content.split(/[\D]/).join('').length > val.maxLen) ? 'ddddddddddd' : mask
                    $(element).mask(set_mask, options)
                }
            }

            $(element).mask(set_mask, options)
        }
    };

    // --- validation

    ko.validation.init({
        registerExtenders: true,
        messagesOnModified: true,
        insertMessages: true,
        parseInputAttributes: true,
        messageTemplate: null
    }, true);

    function buildUI() {
        pji_subform.btn_text(sp.specificConfig.settings.texts.button_step_1);
        pji_subform.user_agreement_line_1(sp.specificConfig.settings.texts.user_agreement_line_1);
        pji_subform.user_agreement_line_2(sp.specificConfig.settings.texts.user_agreement_line_2);
        pji_subform.user_agreement_link(sp.specificConfig.settings.texts.user_agreement_link);
        pji_subform.user_agreement_link_href(sp.specificConfig.settings.user_agreement_link_href);

        pji_subform.title(sp.specificConfig.settings.texts.title)
        pji_subform.title_step_1(sp.specificConfig.settings.texts.title_step_1)
        pji_subform.title_step_2(sp.specificConfig.settings.texts.title_step_2)

        pji_subform.thank_title(sp.specificConfig.settings.texts.thank_title)
        pji_subform.thank_description(sp.specificConfig.settings.texts.thank_description)
        pji_subform.thank_button(sp.specificConfig.settings.texts.thank_button)
        pji_subform.thank_image(sp.specificConfig.settings.texts.thank_image)
        pji_subform.thank_link_href(sp.specificConfig.settings.thank_link_href)

        pji_subform.opt_out_description(sp.specificConfig.settings.texts.opt_out_description)
        pji_subform.legal_text_html(sp.specificConfig.settings.texts.legal_text_html)

        pji_subform.sms_opt_text(sp.specificConfig.settings.texts.sms_opt_text)
        pji_subform.email_opt_text(sp.specificConfig.settings.texts.email_opt_text)

        pji_subform.superscripts(sp.specificConfig.settings.superscripts)

        pji_subform.allow_edit(sp.specificConfig.settings.allow_edit)
        pji_subform.padding_on(sp.specificConfig.settings.padding)
        pji_subform.second_step_submit(sp.specificConfig.settings.second_step_submit)

        pji_subform.day_input_size(sp.specificConfig.settings.day_input_size)
        pji_subform.month_input_size(sp.specificConfig.settings.month_input_size)
        pji_subform.year_input_size(sp.specificConfig.settings.year_input_size)

        pji_subform.day_text = sp.specificConfig.settings.texts.date.day
        pji_subform.month_text = sp.specificConfig.settings.texts.date.month
        pji_subform.year_text = sp.specificConfig.settings.texts.date.year

        var genders = {}

        if (sp.specificConfig.settings.texts.gender) {
            genders.male = sp.specificConfig.settings.texts.gender.male
            genders.female = sp.specificConfig.settings.texts.gender.female
        }

        pji_subform.gender_male(genders.male || 'Male')
        pji_subform.gender_female(genders.female || 'Female')

        if (pji_subform.step() == (sp.specificConfig.settings.steps || 1))
            pji_subform.last_step(true)

        for (let fieldSet of [{
            inSettings: 'main_fields',
            inCode: 'mainFields'
        }, {
            inSettings: 'secondary_fields',
            inCode: 'secondaryFields'
        }]) {

            let tempArr = [];
            for (let [index, field] of sp.specificConfig[fieldSet.inSettings].entries()) {
                if (!(index % 2) && tempArr.length) {
                    pji_subform[fieldSet.inCode].push(tempArr)
                    tempArr = [];
                }

                let el = {
                    name: field.name,
                    value: ko.observable(),
                    type: field.type,
                    isVariable: !!field.variable
                }

                if (field.autocomplete) {
                    el.autocomplete = field.autocomplete
                    el.autocomplete_visible =
                        field.autocomplete_visible === undefined ? true : field.autocomplete_visible
                    if (field.autocomplete_required) {
                        el.value.extend({
                            autocompleteRequired: field.autocomplete.map(x => x.name)
                        })
                    }
                }

                if (field.required) el.value.extend({
                    required: true
                })
                if (field.type == 'email') el.value.extend({
                    required: true,
                    pattern: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
                })

                var dateTexts = {}

                if (sp.specificConfig.settings.texts.date) {
                    dateTexts.day = sp.specificConfig.settings.texts.date.day
                    dateTexts.month = sp.specificConfig.settings.texts.date.month
                    dateTexts.year = sp.specificConfig.settings.texts.date.year
                }

                if (~(['birthday', 'sign_up_date'].indexOf(field.type))) {
                    el.day = ko.observable().extend({
                        defaultIfNull: dateTexts.day || 'Day'
                    });
                    el.month = ko.observable().extend({
                        defaultIfNull: {
                            id: 0,
                            name: dateTexts.month || 'Month'
                        }
                    });
                    el.year = ko.observable().extend({
                        defaultIfNull: dateTexts.year || 'Year'
                    });

                    el.days =
                        (function () {
                            let result = [];
                            for (let y = 1; y <= 31; y++) {
                                result.push(y)
                            }

                            return result;
                        }())

                    el.months = sp.specificConfig.months;

                    el.years =
                        (function () {
                            let result = [];
                            for (let y = 0; y < 117; y++) {
                                result.push(1900 + y)
                            }

                            return result;
                        }())
                }

                if (field.type == 'phone') {
                    el.maskMaxLength = field.phone && field.phone.maskMaxLength;
                    el.countryCode = field.phone && field.phone.countryCode;
                    el.slice = field.phone && field.phone.slice;

                    el.value.extend({
                        maskMaxLength: el.maskMaxLength,
                        mask: (field.phone && field.phone.mask) || '+56 (999) 99-99-99',
                        pattern: (field.phone && field.phone.pattern) || "^(\\+56) \\(([0-9]{3})\\) ([0-9]{2})-([0-9]{2})-([0-9]{2})$"
                    })

                    if (!field.can_be_not_unique) el.value.extend({
                      isPhoneUnique: {
                        maskMaxLength: el.maskMaxLength,
                        countryCode: el.countryCode,
                        in_progress: pji_subform.in_progress
                      }
                    })
                }



                tempArr.push(el)

            }

            pji_subform[fieldSet.inCode].push(tempArr)
            pji_subform[fieldSet.inCode]().forEach(function (fieldArray) {
                fieldArray.forEach(function (field) {
                    if (field.autocomplete) {
                        var autocomplete = field.autocomplete.map(function (x) { return x.name })
                        $('[data-type=' + field.type + ']')._autocomplete({
                            disabled: !field.autocomplete_visible,
                            source: (request, response) => {
                                var res = autocomplete.filter(x => x.toLowerCase().includes(request.term.toLowerCase()))
                                if (res.length) {
                                    response(res)
                                } else {
                                    response([{
                                        label: sp.specificConfig.settings.texts.autocomplete_no_results_text || "No suggestions",
                                        value: request.term
                                    }])
                                }
                            }
                        });
                    }
                })
            })

        }

        document.querySelector('sailplay-magic').style.display = 'block';
    }


    sp.config.subscribe(config => {
        sp.getConfigByName(opts.config || 'subform')
            .then(data => {

                sp.specificConfig = data.config.config;

                var texts = sp.specificConfig.settings.texts

                ko.validation.rules.pattern.message = texts.form_errors && texts.form_errors.pattern || 'Invalid format. Please check the spelling';
                ko.validation.rules.required.message = texts.form_errors && texts.form_errors.required || 'Field is required. Please enter something';
                ko.validation.rules['autocompleteRequired'] = {
                    validator: function (val, autocompleteArray) {
                        return autocompleteArray.some((entry) => val && (entry.toLowerCase() == val.toLowerCase()))
                    },
                    message: texts.form_errors && texts.form_errors.autocomplete_required || "Incorrect value"
                };
                ko.validation.rules['isPhoneUnique'] = {
                  async: true,
                  validator: function(val, params, callback){
                      params.in_progress && params.in_progress(true);
                      let isValid = true;
                      let phoneExists = sp.updateCustomVars({
                          phone: getPhoneValue   ({
                            value: val,
                            maskMaxLength: params.maskMaxLength,
                            countryCode: params.countryCode
                          })
                      })
                      phoneExists.then(data => {
                        if(data.message != "User not found")
                          isValid = false;
                        params.in_progress && params.in_progress(false);
                        callback(isValid);
                      })
                  },
                  message: texts.form_errors && texts.form_errors.phone_not_unique || "Phone is not unique"
                };
                ko.validation.registerExtenders();

                pji_subform = new PJI_Subform();
                pji_subform.errors = ko.validation.group(pji_subform);
                ko.applyBindings(pji_subform, sailplay_element);
                buildUI()
            })
    })

    let pji_subform;
    let sailplay_element = document.querySelector('sailplay-magic');
    sailplay_element.style.display = 'none';
    sailplay_element.innerHTML = mainTemplate()
}

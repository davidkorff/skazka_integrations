import __jquery__ from 'jquery'
import { Dialog } from '@lib/dialog'
let sp = require('@lib/sp');
let profile_callback = window._profile_callback;

__jquery__.noConflict();
require('maskedinput');

ko.validation.rules['date'] = {
    validator: function (val, on) {
        let valid = true
        if (!val) return true
        let test = val.split(' / ');
        let month = parseInt(test[0]);
        let day = parseInt(test[1]);
        let year = parseInt(test[2]);

        if (month < 1) valid = false;
        if (month > 12) valid = false;
        if (day < 1) valid = false;
        if (day > 31) valid = false;
        if (year < 1900) valid = false;
        if (year > 2017) valid = false;

        return valid;
    },
    message: 'error'
};

ko.validation.init({
    registerExtenders: true,
    messagesOnModified: true,
    insertMessages: false,
    parseInputAttributes: false,
    messageTemplate: null
}, true);

ko.bindingHandlers.masked = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        __jquery__.mask.definitions['~'] = '([0-9] )?';
        var mask = allBindingsAccessor().mask || {};
        var options = allBindingsAccessor().mask_options || {};
        __jquery__(element).mask(mask, options);
        ko.utils.registerEventHandler(element, 'focusout', function () {
            var observable = valueAccessor();
            observable(__jquery__(element).val());
        });
    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        __jquery__(element).val(value);
        __jquery__(element).trigger('input.mask') // apply mask
    }
};

class ProfileEditor extends Dialog {
    init(preventClose) {
        this.$template = __jquery__(require('@templates/edit_profile.html'));

        this.user_currency = ko.observable();
        this.user_currencies = ko.observableArray();

        this.preventClose = ko.observable(preventClose);
        this.user = ko.mapping.fromJS(ko.mapping.toJS(sp.user().user));
        this.texts = ko.observable(sp.config().partner.loyalty_page_config.texts);

        this.user.email.extend({
            required: true,
            pattern: '@'
        })
        this.user.first_name.extend({
            required: true
        });
        this.user.last_name.extend({
            required: true
        });
        this.user.birth_date.extend({
            date: true
        });

        this.address_line_1 = ko.observable();
        this.address_line_2 = ko.observable();
        this.state = ko.observable();
        this.city = ko.observable('').extend({
            required: true
        });
        this.post_code = ko.observable('').extend({
            required: true
        });
        this.country = ko.observable('').extend({
            required: true
        })

        this.errors = ko.validation.group({
            email: this.user.email,
            firstName: this.user.first_name,
            lastName: this.user.last_name,
            birthDate: this.user.birth_date,
            postCode: this.post_code,
            country: this.country,
            city: this.city
        });

        sp.getGiftsCategories()
            .then(data => {
                this.user_currencies(data.categories);
                ko.utils.arrayForEach(sp.custom_variables(), item => {
                    switch (item.name) {
                        case 'Address 1':
                            this.address_line_1(item.value);
                            break;
                        case 'Address 2':
                            this.address_line_2(item.value);
                            break;
                        case 'Postcode':
                            this.post_code(item.value);
                            break;
                        case 'State/Province':
                            this.state(item.value);
                            break;
                        case 'City':
                            this.city(item.value);
                            break;
                        case 'Country':
                            this.country(item.value);
                            break;
                        case 'Currency':
                            this.user_currency(item.value)
                            break;
                    }
                })
            })
    }

    getCurrencyName() {
        let currency = ko.utils.arrayFirst(this.user_currencies(), item => {
            return item.id == this.user_currency()
        })

        return currency && currency.name || ''
    }

    update() {
        if (this.errors().length) return

        let filled = true;
        let test = ko.mapping.toJS(this.user);
        if (!test.email) filled = false;
        if (!test.first_name) filled = false;
        if (!test.last_name) filled = false;
        if (!test.birth_date) filled = false;
        if (!test.phone) filled = false;
        if (!this.address_line_1() && !this.address_line_2()) filled = false;
        if (!this.state()) filled = false;
        if (!this.post_code()) filled = false;
        if (!this.city()) filled = false;
        if (!this.user_currency()) filled = false;
        if (!this.country()) filled = false;

        if (filled) {
            sp.tagsAdd({
                tags: sp.config().partner.loyalty_page_config.filled_profile_tag
            })
        }
        sp.updateUserInfo(ko.mapping.toJS(this.user));
        sp.updateCustomVars({
            'Address 1': this.address_line_1() || '',
            'Address 2': this.address_line_2() || '',
            'State/Province': this.state() || '',
            'Postcode': this.post_code() || '',
            'City': this.city() || '',
            'Country': this.country() || '',
            'Currency': this.user_currency() || ''
        });
        if (profile_callback)
            profile_callback();
        this.preventClose(false);
        this.close();
    }
}

class ProfileView {
    constructor() {
        this.user = ko.observable(0);
        this.user_points = ko.observable(0);
        this.texts = ko.observable();
        this.countries = ko.observableArray(["Afghanistan","Albania","Algeria","Andorra","Angola","Anguilla","Antigua &amp; Barbuda","Argentina","Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bermuda","Bhutan","Bolivia","Bosnia &amp; Herzegovina","Botswana","Brazil","British Virgin Islands","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Cape Verde","Cayman Islands","Chad","Chile","China","Colombia","Congo","Cook Islands","Costa Rica","Cote D Ivoire","Croatia","Cruise Ship","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Fiji","Finland","France","French Polynesia","French West Indies","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada","Guam","Guatemala","Guernsey","Guinea","Guinea Bissau","Guyana","Haiti","Honduras","Hong Kong","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyz Republic","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macau","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Namibia","Nepal","Netherlands","Netherlands Antilles","New Caledonia","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion","Romania","Russia","Rwanda","Saint Pierre &amp; Miquelon","Samoa","San Marino","Satellite","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","South Africa","South Korea","Spain","Sri Lanka","St Kitts &amp; Nevis","St Lucia","St Vincent","St. Lucia","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Timor L'Este","Togo","Tonga","Trinidad &amp; Tobago","Tunisia","Turkey","Turkmenistan","Turks &amp; Caicos","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Venezuela","Vietnam","Virgin Islands (US)","Yemen","Zambia","Zimbabwe"])

        sp.config.subscribe(data => {
            this.texts(data.partner.loyalty_page_config.texts)
        })

        sp.user.subscribe(data => {
            if (!data) return

            this.user(data.user);
            this.user_points(data.user_points);

            if (!this.user()) return
            let filled = true;
            if (!data.user.first_name()) filled = false;
            if (!data.user.last_name()) filled = false;

            if (sp.auth_hash) {
                sp.getCustomVars({
                    names: JSON.stringify(['Address 1', 'Address 2', 'State/Province', 'Postcode', 'City', 'Country', 'Currency']),
                }).then(data => {
                    ko.utils.arrayForEach(data.vars, item => {
                        switch (item.name) {
                            case 'City':
                                if (!item.value) filled = false;
                                break;
                            case 'Postcode':
                                if (!item.value) filled = false;
                                break;
                            case 'Country':
                                if (!item.value) filled = false;
                                break;
                        }
                    })

                    if (!filled)
                        new ProfileEditor(true)
                })
            }
        })
    }

    openProfile() {
        new ProfileEditor();
    }
}

module.exports = {
    viewModel: ProfileView,
    template: require('@templates/profile.html')
};

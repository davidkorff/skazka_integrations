import './styles/app.styl';
import ko from 'knockout';
import 'knockout.validation';
import jQuery from 'jquery';
import { Dialog } from '@lib/dialog';
import cookie from 'js-cookie'
jQuery.noConflict();

ko.mapping = require('knockout.mapping')
window.ko = ko;

let cookie_domain = window._cookie_domain || '';
let auth_callback = window._auth_callback;
let sp = require('@lib/sp');

class Login extends Dialog {
    init(redirect) {
        this.$template = jQuery(require('@templates/login.html'));
        this.show_doi_message = ko.observable();
        this.redirect_url = sp.config().partner.loyalty_page_config.lp_url;
        sp.redirect = redirect;
        this.redirect = redirect;
        this.preventClose(!redirect);

        let params = {
            background: 'transparent',
            partner_id: 1781,
            css_link: sp.config().partner.loyalty_page_config.auth_form_css,
            disabled_options: 'agreement',
            texts: JSON.stringify({
                'email_placeholder': ' ',
                'password_placeholder': ' ',
                'login': 'Continue'
            })
        }

        let params_string = '';
        for (var key in params) {
            if (params_string != "") {
                params_string += "&";
            }
            params_string += key + "=" + encodeURIComponent(params[key]);
        }

        this.login_uri = ko.observable(sp.options.domain + '/users/auth-page?' + params_string);
        window.addEventListener('message', this.onMessage, false)
        sp.force_close_popup.subscribe(() => {
            this.close();
        })

        sp.show_doi_message.subscribe(data => {
            this.$template.find('iframe').remove();
            this.preventClose(data);
            this.show_doi_message(1);
        })
    }

    onMessage(event) {
        let data = ko.utils.parseJson(event.data)

        function authorize(auth_hash, exec_callback) {
            cookie.set('sp_auth_hash', auth_hash, { path: '/', domain: cookie_domain});
            sp.auth_hash = auth_hash;

            sp.getUserInfo({
                user_status: 1
            }).then(() => {
                if (auth_callback && exec_callback) auth_callback();

                if (sp.redirect) {
                    location.assign(sp.config().partner.loyalty_page_config.lp_url);
                    return
                }

                sp.tagsList({
                    show_calculated_values: 1
                }, auth_hash)
            });

            sp.getUserHistory();
        }

        if (data && data.name) {
            if (data.name == 'login.check' && data.auth_hash && data.auth_hash != 'None') {
                sp.tagsExist([sp.config().partner.loyalty_page_config.doi_tag], data.auth_hash)
                    .then(result => {

                        sp.tagsAdd({
                            tags: [sp.config().partner.loyalty_page_config.after_register_tag, sp.config().partner.loyalty_page_config.brand_tag, sp.config().partner.loyalty_page_config.registered_tag]
                        }, data.auth_hash)

                        if (!result.tags[0].exist) {

                            if (!sp.redirect) {
                                // это на самом деле не то, смотри строчку 52
                                sp.show_doi_message(1)
                                authorize(data.auth_hash);
                            } else {
                                sp.show_doi_message(1)
                                cookie.set('sp_auth_hash', data.auth_hash, { path: '/', domain: cookie_domain} );
                            }
                            return
                        } else {
                            authorize(data.auth_hash, true);
                            sp.force_close_popup(1);
                        }
                    })

            } else if (sp.auth_hash) {
                sp.user(false)
            }
        }
    }
}

class MainView {
    constructor(options) {
        this.config = ko.observable();
        this.user = ko.observable();
        this.texts = ko.observable();

        sp.init(options);

        sp.user.subscribe(data => {
            this.user(data)
        })

        sp.auth_hash = cookie.get('sp_auth_hash');

        sp.config.subscribe(data => {
            this.texts(data.partner.loyalty_page_config.texts)

            if (!sp.auth_hash) {
                if (window._prompt_login) {
                    new Login(true)
                }
            }

            if (window._invisible)
                return

            if (sp.auth_hash) {
                sp.getUserInfo({
                    user_status: 1
                }).then(() => {
                    sp.tagsList({
                        show_calculated_values: 1
                    })
                });

                sp.getUserHistory();
            }

            this.config(data.partner.loyalty_page_config);

        })
    }
}

window._remoteLogin = () => {
    new Login(true)
}

window._logout = () => {
    cookie.remove('sp_auth_hash', { path: '/', domain: cookie_domain})

    let req = document.createElement('iframe');
    req.width = 0;
    req.height = 0;
    req.style.border = 'none';
    req.src = sp.options.domain + '/users/logout';
    document.body.appendChild(req);
    req.onload = () => {
        document.body.removeChild(req);
        sp.auth_hash = '';
        sp.user(false);
        if (sp.config().partner.loyalty_page_config.logout_url) {
            location.assign(sp.config().partner.loyalty_page_config.logout_url)
        }
        else if (sp.config().partner.loyalty_page_config.force_logout_redirect)
        {
            location.reload()
        }
    }
}

for (let component of [
    'profile',
    'status',
    'status-bar',
    'questions',
    'banner',
    'history',
    'coupons',
    'quests',
    'subscribe-toggler'
]) {
    ko.components.register(`sailplay-${component}`, require(`./components/${component}`))
}

let template_name = 'magic';
if (window._quests)
    template_name = 'quests_page'

ko.components.register('sailplay-magic', {
    viewModel: {
        createViewModel: () => {
            return new MainView({
                domain: window._domain
            })
        }
    },
    template: require(`@templates/${template_name}.html`)
});

ko.applyBindings();

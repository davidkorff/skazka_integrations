(function () {
    let jsonp = require('./jsonp');

    class SailPlay {
        constructor() {
            this.config = ko.observable();
            this.inited = ko.observable();

            this.user = ko.observable();
            this.custom_variables = ko.observableArray();
            this.history = ko.observableArray();
            this.tags = ko.observableArray();
            this.force_close_popup = ko.observable();
            this.show_doi_message = ko.observable();
            this.actions = ko.observable();
            this.actions_config = ko.observable();

            this.latest_user_options = {};
            this.latest_tags_options = {};

            this.user_had_phone = false;
            this.user_had_email = false;

            this.options = {};
        };

        init(options) {
            let self = this;

            self.inited(true);
            self.options.partner_id = 1781;
            self.options.domain = options.domain || 'https://sailplay.net';
            self.auth_hash = options.auth_hash;

            jsonp({
                url: `${self.options.domain}/js-api/${self.options.partner_id}/config`,
                data: {
                    lang: options.lang || 'en',
                    dep_id: options.dep_id || 1,
                },
                success: data => {
                    if (window._config) {
                        jsonp({
                            url: `${self.options.domain}${data.config.urls.loyalty_page_config_by_name}`,
                            data: {
                                name: window._config
                            },
                            success: config_data => {
                                data.config.partner.loyalty_page_config = config_data.config.config;
                                self.config(data.config);
                            }
                        })
                    } else
                    self.config(data.config);
                }
            })
        };

        getUserInfo(options) {
            if (!this.inited())
                throw new Error('sp not inited');

            return new Promise((resolve, reject) => {
                this.latest_user_options = options;
                jsonp({
                    url: `${this.options.domain}${this.config().urls.users.info}`,
                    data: {
                        ...options,
                        auth_hash: this.auth_hash,
                        all: 1
                    },
                    success: data => {
                        this.user(ko.mapping.fromJS(data));
                        if (this.user().user.birth_date()) {
                            let date = this.user().user.birth_date();
                            this.user().user.birth_date(`${date.split('-')[1]} / ${date.split('-')[2]} / ${date.split('-')[0]}`)
                        }

                        if (this.user().user.email())
                            this.user_had_email = this.user().user.email()

                        if (this.user().user.phone())
                            this.user_had_phone = this.user().user.phone()
                        resolve(data);
                    }
                })
            })
        }

        getCustomActions() {
            if (!this.inited())
                throw new Error('sp not inited');

            return new Promise((resolve, reject) => {
                jsonp({
                    url: `${this.options.domain}${this.config().urls.actions.custom.list}`,
                    data: {
                        auth_hash: this.auth_hash
                    },
                    success: resolve
                })
            })
        }

        getActions() {
            if (!this.inited())
                throw new Error('sp not inited');

            return new Promise((resolve, reject) => {
                jsonp({
                    url: `${this.options.domain}${this.config().urls.actions.load}`,
                    data: {
                        auth_hash: this.auth_hash
                    },
                    success: data => {
                        this.actions(data.data);

                        let config = {...data};
                        this.actions_config(config.data);
                        resolve(data)
                    }
                })
            })
        }

        getCustomVars(data) {
            if (!this.inited())
                throw new Error('sp not inited');

            return new Promise((resolve, reject) => {
                data.auth_hash = this.auth_hash;

                jsonp({
                    url: `${this.options.domain}${this.config().urls.users.custom_variables.batch_get}`,
                    data: data,
                    success: result => {
                        this.custom_variables(result.vars);
                        resolve(result);
                    }
                })
            })
        }

        getGifts() {
            if (!this.inited())
                throw new Error('sp not inited');

            return new Promise((resolve, reject) => {
                jsonp({
                    url: `${this.options.domain}${this.config().urls.gifts.list}`,
                    data: {
                        auth_hash: this.auth_hash
                    },
                    success: result => {
                        resolve(result)
                    }
                })
            })
        }

        getUserHistory() {
            if (!this.inited())
                throw new Error('sp not inited');

            return new Promise((resolve, reject) => {

                jsonp({
                    url: `${this.options.domain}${this.config().urls.users.history}`,
                    data: {
                        auth_hash: this.auth_hash
                    },
                    success: result => {
                        this.history(result.history)
                        resolve(result)
                    }
                })
            })
        }

        getGiftsCategories() {
            if (!this.inited())
                throw new Error('sp not inited');

            return new Promise((resolve, reject) => {

                jsonp({
                    url: `${this.options.domain}${this.config().urls.gifts.categories_list}`,
                    data: {
                        // auth_hash: this.auth_hash
                    },
                    success: result => {
                        // this.history(result.history)
                        resolve(result)
                    }
                })
            })
        }

        tagsList(options, auth_hash) {
            if (!this.inited())
                throw new Error('sp not inited');

            this.latest_tags_options = options;
            return new Promise((resolve, reject) => {
                jsonp({
                    url: `${this.options.domain}${this.config().urls.tags.list}`,
                    data: {
                        ...options,
                        origin_user_id: this.user() && this.user().user.origin_user_id() || 0,
                        auth_hash: auth_hash || this.auth_hash,
                    },
                    success: result => {
                        this.tags(result.tags);
                        resolve(result);
                    }
                })
            })
        }

        tagsExist(tags_arr = [], auth_hash) {
            if (!this.inited())
                throw new Error('sp not inited');

            return new Promise((resolve, reject) => {
                jsonp({
                    url: `${this.options.domain}${this.config().urls.tags.exist}`,
                    data: {
                        tags: JSON.stringify(tags_arr),
                        auth_hash: auth_hash || this.auth_hash
                    },
                    success: resolve
                })
            })
        }

        tagsAdd(options, auth_hash) {
            if (!this.inited())
                throw new Error('sp not inited');

            return new Promise((resolve, reject) => {
                jsonp({
                    url: `${this.options.domain}${this.config().urls.tags.add}`,
                    data: {
                        ...options,
                        origin_user_id: this.user() && this.user().user.origin_user_id() || 0,
                        auth_hash: auth_hash || this.auth_hash,
                    },
                    success: result => {
                        this.tagsList(this.latest_tags_options)
                        resolve(result);
                    }
                })
            })
        }

        tagsDelete(options, auth_hash) {
            if (!this.inited())
                throw new Error('sp not inited');

            return new Promise((resolve, reject) => {
                jsonp({
                    url: `${this.options.domain}${this.config().urls.tags.delete}`,
                    data: {
                        ...options,
                        origin_user_id: this.user() && this.user().user.origin_user_id() || 0,
                        auth_hash: auth_hash || this.auth_hash,
                    },
                    success: result => {
                        this.tagsList(this.latest_tags_options)
                        resolve(result);
                    }
                })
            })
        }

        updateUserInfo(data) {
            if (!this.inited())
                throw new Error('sp not inited');

            let _data = {
                auth_hash: this.auth_hash
            };
            if (data.first_name) _data.firstName = data.first_name
            if (data.last_name) _data.lastName = data.last_name
            if (data.birth_date) _data.birthDate = data.birth_date
            if (data.email) _data.email = data.email
            if (data.phone) _data.phone = data.phone

            if (!this.user_had_email && _data.email && this.user_had_email != _data.email) {
                _data.addEmail = _data.email;
                delete _data['email']
            }

            if (!this.user_had_phone && _data.phone && this.user_had_phone != _data.phone) {
                _data.addPhone = _data.phone;
                delete _data['phone']
            }

            return new Promise((resolve, reject) => {
                jsonp({
                    url: `${this.options.domain}${this.config().urls.users.update}`,
                    data: _data,
                    success: result => {
                        if (result.status == 'ok') {
                            this.getUserInfo(this.latest_user_options);
                            resolve(result);
                        }
                    }
                })
            })
        }

        updateCustomVars(date) {
            if (!this.inited())
                throw new Error('sp not inited');

            return new Promise((resolve, reject) => {
                date.auth_hash = this.auth_hash;

                jsonp({
                    url: `${this.options.domain}${this.config().urls.users.custom_variables.add}`,
                    data: date,
                    success: resolve
                })
            })
        }

        purchaseGet(id) {
            if (!this.inited())
                throw new Error('sp not inited');

            return new Promise((resolve, reject) => {
                jsonp({
                    url: `${this.options.domain}${this.config().urls.purchases.get}`,
                    data: {
                        id: id,
                        auth_hash: this.auth_hash
                    },
                    success: resolve
                })
            })
        }

        purchaseGift(gift_data) {
            if (!this.inited())
                throw new Error('sp not inited');

            return new Promise((resolve, reject) => {
                jsonp({
                    url: `${this.options.domain}${this.config().urls.gifts.purchase.purchase}`,
                    data: {
                        gift_id: gift_data.id,
                        auth_hash: this.auth_hash,
                        dep_id: this.config().partner.depId || ''
                    },
                    success: data => {
                        if (data.is_completed) {
                            this.getUserInfo(this.latest_user_options);
                            this.getUserHistory();
                            resolve(data);
                            return
                        }

                        jsonp({
                            url: `${this.options.domain}${this.config().urls.gifts.purchase.force_confirm}`,
                            data: {
                                gift_public_key: data.gift_public_key,
                                auth_hash: this.auth_hash,
                                no_user_sms: true
                            },
                            success: result => {
                                this.getUserInfo(this.latest_user_options);
                                this.getUserHistory();
                                resolve(result)
                            }
                        })
                    }
                })
            })
        }

        popupWindow(url, title, w, h) {
            var width, height, left, top;
            if (w !== undefined && h !== undefined) {
                width = w;
                height = h;
                left = (screen.width / 2) - (w / 2);
                top = (screen.height / 2) - (h / 2);
            } else {
                width = screen.width / 2;
                height = screen.height / 2;
                left = width - (width / 2);
                top = height - (height / 2);
            }

            return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, copyhistory=no, width=' + width + ', height=' + height + ', top=' + top + ', left=' + left);
        };

        openSocialRegNeedPopup(action) {
            var w;
            if (action.socialType == 'vk')
                w = this.popupWindow(this.actions_config().social.vk.authUrl, 'social_reg', 840, 400);
            else if (action)
                w = this.popupWindow(this.actions_config().social[action.socialType].authUrl, 'social_reg');

            console.log(this.actions_config().social[action.socialType].authUrl, 'social_reg'
            )
            var checkPopupInterval = setInterval(() => {
                if (w == null || w.closed) {
                    this.performComplete()
                    clearInterval(checkPopupInterval);
                }
            }, 100);
        }

        performAction(action) {
            if (action.socialType && this.actions_config().connectedAccounts) {
                      return this.share(action);
            } else if (!action.socialType && !action.content) {
                var frameUrl = `https://sailplay.net/popup/${this.config().partner.id}/widgets/custom/${action.type}/?auth_hash=${this.auth_hash}`;
                frameUrl += '&lang=' + this.config().lang || 'en';
                frameUrl += '&from_sdk=0';
                var actionFrame = this.popupWindow(frameUrl, 'SailPlay', 600, 400);
                var checkPopupInterval = setInterval(() => {
                    if (actionFrame == null || actionFrame.closed) {
                        this.performComplete()
                        clearInterval(checkPopupInterval);
                    }
                }, 200);
            } else {
                let name = this.config_name;
                let config = this.config;

                // iframe.style.backgroundColor = "transparent";
                // iframe.frameBorder = "0";
                // iframe.allowTransparency="true";

                var iframeUrl = `https://sailplay.net${this.config().urls.actions.custom.render.replace(':action_id', action.id)}?auth_hash=${this.auth_hash}&lang=${this.options.lang || 'en'}`
            };
        }

        share(action) {
            var button_text = action.action=='partner_page' ? 'Share' : 'Link account'
            var frameUrl = `https://sailplay.net/js-api/${this.config().partner.id}/actions/social-widget/v2/?auth_hash=${this.auth_hash}`;
            frameUrl += '&socialType=' + action.socialType + '&action=' + action.action + '&link=' + encodeURIComponent(action.shortLink) + '&pic=' + (this.actions_config().partnerCustomPic ? this.actions_config().partnerCustomPic : this.config().partner.logo);
            frameUrl += '&msg=' + this.actions_config().messages[action.action] + '&text=' + button_text;
            frameUrl += '&_actionId=' + action['_actionId'];
            frameUrl += action.socialType == 'gp' ? '&account_connected=true' : '&account_connected=' + (action.action == 'partner_page' && action.socialType == 'fb' ? 'true' : 'false')

            return frameUrl;
          /*  var height = 200
            var width = 210

            if (action.action == 'purchase') {
                frameUrl += '&purchasePublicKey=' + this.actions_config().purchasePublicKey;
            }
            if (action.socialType == 'gp') {
                height = 400
                width = 400
            }

            var socialFrame = this.popupWindow(frameUrl, 'social_action', height, width);
            var checkPopupInterval = setInterval(() => {
                if (socialFrame == null || socialFrame.closed) {
                    this.performComplete()
                    clearInterval(checkPopupInterval);
                }
            }, 200);*/

        };
    }

    let sp = new SailPlay()

    module.exports = sp;
})();

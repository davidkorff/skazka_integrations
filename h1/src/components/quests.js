let sp = require('@lib/sp')
import jQuery from 'jquery';

class QuestsView {
    constructor(params) {
        this.quests = ko.observableArray()
        this.texts = ko.observable()
        this.iframeUrls = ko.observableArray()

        sp.config.subscribe(data => {
            this.texts(data.partner.loyalty_page_config.texts);

            jQuery(document).on('click', '.__sailplay-social-btn', event => {
              event.stopPropagation();
              let id = jQuery(event.currentTarget).parent().data('id');
              //jQuery('.__sailplay-gift__redeem-active').removeClass('__sailplay-gift__redeem-active');
              //jQuery(event.currentTarget).addClass('__sailplay-gift__redeem-active')
              let url = this.perform(id);
              return false;
          })

          window.addEventListener("message", finishAction, false)

          function finishAction(event)
          {
            if(JSON.parse(event.data).name == 'actions.perform.success') {
              sp.getUserInfo();
            }
          }
        })

        sp.user.subscribe(data => {
            if (!data) return

            Promise.all([sp.getActions(), sp.getCustomActions()])
                .then(data => {
                    let merge = data[0].data.actions.concat(data[1].actions);

                    merge.sort((a, b) => {
                        function get_order(item) {
                            if (item.type == 'socialSharing')
                                return sp.config().partner.loyalty_page_config.actions[item.socialType][item.action].order
                            else
                                return sp.config().partner.loyalty_page_config.actions[item.type].order
                        }
                        return get_order(a) - get_order(b)
                    })
                    let urls = []
                    for (var i=0; i < merge.length; i++) {
                        let iframeUrlCurrent = merge.length+1 == i ? "" : (merge[i].type == "socialSharing" ? sp.performAction(merge[i]) : "")
                        urls.push(ko.observable(iframeUrlCurrent))
                    }
                    urls.push(ko.observable(""))
                    this.iframeUrls(urls)
                    this.quests(merge)

                    this.quests.valueHasMutated();
                })
        })

        sp.performComplete = () => {
          sp.getUserInfo()
        }
    }

    perform(id) {
        let url = sp.performAction(this.quests()[id])
        url = typeof url !== 'undefined' ? url : ""
        this.iframeUrls()[id](url)
        this.iframeUrls()[id].valueHasMutated()
    }

    trustpilot(url) {
      window.open(url.content.url)
      sp.tagsAdd({tags: ["TrustPilot"], email: sp.user().user.email()}, sp.auth_hash)
      setTimeout(sp.getUserInfo(), 1000)
    }

    getIcon(item) {
        if (item.type == 'socialSharing')
            return sp.config().partner.loyalty_page_config.actions[item.socialType][item.action].icon
        else
            return sp.config().partner.loyalty_page_config.actions[item.type].icon
    }

    getTitle(item) {
        if (item.type == 'socialSharing')
            return sp.config().partner.loyalty_page_config.actions[item.socialType][item.action].title
        else
            return sp.config().partner.loyalty_page_config.actions[item.type].title
    }

    getDesc(item) {
        if (item.type == 'socialSharing')
            return sp.config().partner.loyalty_page_config.actions[item.socialType][item.action].description
        else
            return sp.config().partner.loyalty_page_config.actions[item.type].description
    }
}

module.exports = {
    viewModel: params => new QuestsView(params),
    template: require('@templates/quests.html')
};

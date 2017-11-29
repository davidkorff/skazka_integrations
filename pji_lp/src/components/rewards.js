import 'owl.carousel/dist/assets/owl.carousel.css';
import '../../imports-loader?jQuery=jquery!owl.carousel';
import {
    subscribe,
    publish
} from '../messager';

jQuery.noConflict();

class rewardsView {
    constructor() {
        this.gifts = ko.observableArray();

        this.start_redeem = ko.observable(false);
        this.active_gift = ko.observable();
        this.close_redeem_popup = this.close_redeem_popup.bind(this);
        this.confirm_redeem = this.confirm_redeem.bind(this);
        this.user = ko.observable();
        this.texts = ko.observable();
        this.readonly = ko.observable();

        subscribe(gifts => {
            this.gifts(gifts);
            setTimeout(() => {
                this.init_owl();
            }, 50)
        }, 'gifts.list.success')

        subscribe(user => {
            this.user(user)
        }, 'load.user.info');

        subscribe(instance => {
            this.sp = instance
        }, 'instance.success')

        subscribe(config => {
            this.texts(config.config.texts)
            this.readonly(config.config.gifts_readonly)
        }, 'config.load')
    }

    init_owl() {
        jQuery('.__sailplay-owl-carousel').owlCarousel({
            stagePadding: 20,
            margin: 10,
            items: 1,
            loop: false,
            mouseDrag: true,
            nav: true,
            refreshClass: '__sailplay-owl-refresh',
            loadedClass: '__sailplay-owl-loaded',
            loadingClass: '__sailplay-owl-loading',
            rtlClass: '__sailplay-owl-rtl',
            responsiveClass: '__sailplay-owl-responsive',
            dragClass: '__sailplay-owl-drag',
            itemClass: '__sailplay-owl-item',
            stageClass: '__sailplay-owl-stage',
            stageOuterClass: '__sailplay-owl-stage-outer',
            grabClass: '__sailplay-owl-grab',
            navClass: ['__sailplay-owl-prev', '__sailplay-owl-next'],
            navText: ['', ''],
            responsive: {
                1024: {
                    items: 4,
                    stagePadding: 40,
                    margin: 10                    
                },

                800: {
                    items: 3,
                    stagePadding: 40,
                    margin: 10                                                 
                },

                600: {
                    items: 2,
                    stagePadding: 20,
                    margin: 10                                        
                }
            }
        });

        jQuery(document).on('click', '.__sailplay-gift__redeem', event => {
            let index = jQuery(event.currentTarget).parent().data('id');
            jQuery('.__sailplay-gift__redeem-active').removeClass('__sailplay-gift__redeem-active');   
            jQuery(event.currentTarget).addClass('__sailplay-gift__redeem-active')     
            this.show_redeem_popup(index);
        })
    }

    close_redeem_popup() {
        this.start_redeem(false);
        this.active_gift();
        jQuery('.__sailplay-gift__redeem-active').removeClass('__sailplay-gift__redeem-active');        
    }

    show_redeem_popup(index) {
        if (this.readonly()) return 

        this.active_gift(this.gifts()[index]);
        this.start_redeem(true);
    }

    confirm_redeem() {
        this.sp.purchaseGift(this.active_gift())
            .then(data => location.reload())
    }
}

module.exports = {
    viewModel: rewardsView,
    template: require('@templates/rewards.html')
}
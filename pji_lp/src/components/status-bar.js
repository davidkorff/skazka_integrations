import {
    subscribe
} from '../messager';

class statusBarView {
    constructor() {
        this.points = ko.observable();
        this.status_points = ko.observableArray();
        this.texts = ko.observable();

        subscribe(data => {
            this.points(data.user_points.confirmed)
        }, 'load.user.info');

        subscribe(config => {
            this.status_points(config.config.status_points);
        }, 'config.load')

        this.fill = ko.computed(() => {
            return `${this.points() / this.status_points()[this.status_points().length - 1] * 100}%`;
        })

        subscribe(config => {
            this.texts(config.config.texts)
        }, 'config.load')
    }
}

module.exports = {
    viewModel: statusBarView,
    template: require('@templates/status-bar.html')
}

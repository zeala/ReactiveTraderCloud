import Rx from 'rx';
import _ from 'lodash';

export default class OpenFin {

  available:boolean = false;
  //currentWindow:OpenFinWindow;

  //windows:Array<TearoutWindowInfo> = [];
  tradeClickedSubject:Rx.Subject<string>;
  //analyticsSubscription:Rx.IDisposable;
  // pricesSubscription:Rx.IDisposable;
  limitCheckSubscriber:string;
  requestLimitCheckTopic:string;
  limitCheckId:number = 1;

  constructor() {
    this.tradeClickedSubject = new Rx.Subject();
    if (typeof fin === 'undefined') return;

    this.available = true;
    this.limitCheckId = 1;
    this.requestLimitCheckTopic = 'request-limit-check';
    console.log('Application is running in OpenFin container');
    // this.setToolbarAsDraggable();
  }

  checkLimit(executablePrice, notional:number, tradedCurrencyPair:string):Rx.Observable<boolean> {
    return Rx.Observable.create(observer => {
        let disposables = new Rx.CompositeDisposable();
        if (!this.available || this.limitCheckSubscriber == null) {
          console.log('client side limit check not up, will delegate to to server');
          observer.onNext(true);
          observer.onCompleted();
        } else {
          console.log('checking if limit is ok with ' + this.limitCheckSubscriber);
          var topic = 'limit-check-response' + (this.limitCheckId++);
          var limitCheckResponse:(msg:any) => void = (msg) => {
            console.log(this.limitCheckSubscriber + ' limit check response was ' + msg);
            observer.onNext(msg.result);
            observer.onCompleted();
          };

          fin.desktop.InterApplicationBus.subscribe(this.limitCheckSubscriber, topic, limitCheckResponse);

          fin.desktop.InterApplicationBus.send(this.limitCheckSubscriber, this.requestLimitCheckTopic, {
            id: this.limitCheckId,
            responseTopic: topic,
            tradedCurrencyPair: tradedCurrencyPair,
            notional: notional,
            rate: executablePrice.rate
          });

          disposables.add(Rx.Disposable.create(() => {
            fin.desktop.InterApplicationBus.unsubscribe(this.limitCheckSubscriber, topic, limitCheckResponse);
          }));
        }
        return disposables;
      });
  }

  viewChartIQ(symbol): void {
    this.getChartIQInstance(symbol, this.refreshChartIQ, this.startChartIQ);
  }

  getChartIQInstance(symbol, callback, errorHandler):fin.desktop.Application{
    let chartIqAppId = 'ChartIQ';
    fin.desktop.System.getAllApplications(function(apps) {
      let chartIqApp = _.find(apps, ((app) => {
        return app.isRunning && app.uuid === chartIqAppId;
      }));
      if(chartIqApp) {
        if (callback) callback(symbol);
      } else {
        if (errorHandler) errorHandler(symbol);
      }
    });
  }

  refreshChartIQ(symbol){
    let interval = 5;
    let chartIqAppId = 'ChartIQ';
    console.log(`Publishing message to chartIQ with symbol ${symbol} and interval ${interval}`);
    fin.desktop.InterApplicationBus.publish('chartiq:main:change_symbol', { symbol: symbol, interval: interval });
  }

  startChartIQ(symbol){
    let interval = 5;
    let chartIqAppId = 'ChartIQ';
    console.log('Chart IQ was not running, so starting new app with symbol = ' + symbol + ' and interval ' + interval);
    
    let url = `http://openfin.chartiq.com/0.5/chartiq-shim.html?symbol=${symbol}&period=${interval}`;
    let name = `chartiq_${(new Date()).getTime()}`;
    const applicationIcon = 'http://openfin.chartiq.com/0.5/img/openfin-logo.png';
    let app = new fin.desktop.Application({
      uuid: chartIqAppId,
      url: url,
      name: name,
      applicationIcon: applicationIcon,
      mainWindowOptions:{
        autoShow: false
      }
    }, function(){
      app.run();
    });
  }
}

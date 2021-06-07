class Main {
    constructor() {
        this.mainTab = null;
        this.currentSeries = [];

        this.init();
    }

    async init() {
        await this.start();
        setInterval(async () => {
            await this.start();
        }, 60 * 1000 * 60);
    }

    async start() {
        console.log('Starting');
        await this.setMainTab();
        await this.getSubscribedSeries();
        //this.currentSeries[0].endedEpisodes = 4;
        await this.updateSeriesInfo();
        await this.returnToStartPage();
    }

    async setMainTab() {
        return new Promise(resolve => {
            chrome.tabs.query({ pinned: true, url: 'https://shinden.pl/' }, tabs => {
                if (tabs.length) {
                    this.mainTab = tabs[0];
                } else {
                    chrome.tabs.create({ pinned: true, url: 'https://shinden.pl' }, tab => {
                        this.mainTab = tab;
                    });
                }

                resolve();
            });
        });
    }

    async getSubscribedSeries() {
        return new Promise(resolve => {
            chrome.storage.local.get(['series'], value => {
                console.log(value, 'asd');
                this.currentSeries = JSON.parse(value.series);
                console.log('got Value', value);
                resolve();
            });
        });
    }

    async updateSeriesInfo() {
        const updatedSeries = [];
        for (const currentSerie of this.currentSeries) {
            const endedEpisodes = await this.getSerieInfo(currentSerie);
            //const serie = this.currentSeries.filter(serie => currentSerie.id === serie.id);
            let shouldNotify = currentSerie.shouldNotify;

            if (!shouldNotify)
                shouldNotify = endedEpisodes[0] > currentSerie.endedEpisodes ? true : false;

            if (shouldNotify) {
                chrome.notifications.create('', {
                    title: `Nowy odcinek ${currentSerie.name} jest dostępny!`,
                    message: 'Miłego oglądania!',
                    type: 'basic',
                    iconUrl:
                        'https://proofmart.com/wp-content/uploads/2020/10/IDEA-PRODUCT-600x600.png',
                });
            }

            updatedSeries.push({ ...currentSerie, endedEpisodes: endedEpisodes[0], shouldNotify });
        }

        this.currentSeries = updatedSeries;
        console.log(this.currentSeries, 'currentSeries', updatedSeries);

        chrome.storage.local.set({
            series: JSON.stringify(this.currentSeries),
        });
    }

    async getSerieInfo(serie) {
        return new Promise(async resolve => {
            await this.goTo(serie.url);
            console.log('Executing script on', serie.url);
            const result = await this.executeScript(`(function (){
                return document.querySelector('.list-episode-checkboxes').querySelectorAll('.fa.fa-fw.fa-check').length})();`);
            console.log('Got result', result);
            resolve(result);
        });
    }

    async executeScript(code) {
        return new Promise(resolve => {
            chrome.tabs.executeScript(this.mainTab.id, { code }, res => resolve(res));
        });
    }

    async goTo(url) {
        return new Promise(resolve => {
            chrome.tabs.update(this.mainTab.id, { url: url });
            chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
                if (tabId === this.mainTab.id && changeInfo.status === 'complete') {
                    resolve();
                    console.log('Loaded');
                    chrome.tabs.onUpdated.removeListener();
                }
            });
        });
    }

    async returnToStartPage() {
        return new Promise(resolve => {
            chrome.tabs.update(this.mainTab.id, { url: 'https://shinden.pl' }, resolve);
        });
    }

    async sleep(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }
}

new Main();

console.log('Whatever');

<template>
    <div class="container">
        <form class="container_addSeries" @submit="addItem($event)">
            <input
                type="text"
                v-model="form.seriesName"
                class="addSeries_input"
                placeholder="Nazwa"
            />
            <input
                type="text"
                v-model="form.seriesUrl"
                class="addSeries_input"
                placeholder="Link do epizodów serii"
            />
            <button class="addSeries_submit">Dodaj</button>
        </form>
        <ul class="container_series" v-if="currentSeries.length">
            <li
                class="series_serie"
                v-for="serie in currentSeries"
                @click="openTab(serie.url)"
                :key="serie.id"
            >
                <div class="serie_name">{{ serie.name }}</div>
                <p class="serie_notify">
                    {{ serie.shouldNotify ? 'Nowe odcinki' : 'Brak nowych odcinkow' }}
                </p>
            </li>
        </ul>
        <p class="container_msg" v-else>No series found</p>
    </div>
</template>
<script>
export default {
    data() {
        return {
            form: {
                seriesName: '',
                seriesUrl: '',
            },

            currentSeries: [],
        };
    },
    computed: {},
    created() {
        this.getItems();
        setInterval(() => {
            this.getItems();
        }, 60 * 1000 * 60);
    },
    mounted() {},
    methods: {
        addItem(e) {
            e.preventDefault();

            if (this.form.seriesName === '' || this.form.seriesUrl === '') {
                alert('Pola formularza nie mogą być puste!');
                return;
            }

            this.currentSeries.push({
                id: this.currentSeries.length,
                name: this.form.seriesName,
                url: this.form.seriesUrl,
            });

            chrome.storage.local.set({
                series: JSON.stringify(this.currentSeries),
            });
        },

        getItems() {
            console.log('gettingItems');
            chrome.storage.local.get(['series'], value => {
                this.currentSeries = JSON.parse(value.series);
            });

            console.log(this.currentSeries);
        },

        openTab(url) {
            chrome.tabs.create({ url: url });
        },
    },
};
</script>
<style lang="scss">
* {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
    box-sizing: border-box;
}

.container {
    width: 400px;
    height: 400px;

    padding: 3%;

    background-color: rgb(28, 27, 34);

    .container_addSeries {
        width: 100%;
        height: 35%;

        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;

        .addSeries_input,
        .addSeries_submit {
            width: 80%;
            height: 30%;

            border-radius: 5px;
            border: none;

            font-size: 18px;
        }

        .addSeries_input {
            text-align: center;
            padding: 3%;

            background-color: #5f5d63;
            color: #1c1b22;
        }

        .addSeries_input:focus {
            outline: none;
        }

        .addSeries_submit {
            font-size: 20px;

            background-color: #0f0c1d;
            color: #1c1b22;

            transition: background-color 0.2s, color 0.2s;
        }

        .addSeries_submit:hover {
            color: #0f0c1d;
            background-color: #1c1b22;
            cursor: pointer;
        }
    }
    .container_series {
        width: 100%;
        height: 65%;

        padding: 3%;

        overflow-y: scroll;

        display: flex;
        flex-direction: column;

        .series_serie {
            width: 100%;
            height: 15%;

            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1%;

            border-bottom: 2px solid #5f5d63;

            background-color: rgb(28, 27, 34);
            color: #5f5d63;

            .serie_name {
                text-transform: uppercase;
            }
        }

        .series_serie:hover {
            cursor: pointer;
        }
    }

    .container_msg {
        width: 100%;

        padding: 3%;

        color: #5f5d63;
        text-align: center;
    }
}
</style>

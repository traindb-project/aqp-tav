<template>
    <!--region 확장된 질의 요청-->
    <main>
        <div id="label-request" class="flex-shrink-0 p-3 bg-white">
            <a href="#" class="d-flex align-items-center pb-3 mb-3 link-dark text-decoration-none border-bottom">
                <span class="fs-5 fw-semibold">확장된 질의 요청</span>
            </a>
        </div>

        <div class="container-fluid">
            <div class="row">
                <div class="input-group">
                    <textarea class="form-control" aria-label="With textarea" v-model=query></textarea>
                </div>
            </div>

            <div class="row">
                <div class="col-8"></div>
                <div class="col-1"><h6>실행모드</h6></div>
                <div class="col-2">
                    <label>
                        <select class="form-control">
                            <option>디버그 모드</option>
                            <option>런타임 모드</option>
                        </select>
                    </label>
                </div>
                <div class="col-1">
                    <button type="button" class="btn btn-primary" v-on:click="requestQuery">실행</button>
                </div>
            </div>
        </div>
    </main>
    <!--endregion 확장된 질의 요청-->
</template>

<script>
let api_url = 'http://ba.bimatrix.co.kr:8000'
export default {
    name: "RequestForm",
    data() {
        return {
            query: 'SELECT * FROM IRIS WHERE 1=1',
        }
    },
    methods: {
        async requestQuery() {
            await fetch(api_url + '/api/query', {
                method: 'POST',
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({'query': this.query}),
            }).then((response) => {
                if (!response.ok) {
                    throw new Error(
                        `This is an HTTP error: The status is ${response.status}`
                    );
                }
                return response.json()
            }).then((query_result) => {
                console.log(query_result)
                this.$store.dispatch('receivedNewData', query_result.data);
                this.emitter.emit('updated_spreadsheet', query_result);
            }).catch((error) => {
                console.error(error);
            });
        },
    },
}
</script>

<style scoped>
main {
    margin-left: 100px;
    margin-right: 100px;
    margin-bottom: 50px
}

#label-request {
    width: 280px;
}

textarea {
    height: 70px;
    margin-bottom: 20px;
}

h6 {
    margin-top: 10px;
}

button {
    float: right;
}

</style>
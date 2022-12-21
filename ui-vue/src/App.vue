<template>
    <RequestData/>

    <main>
        <div id="label-response" class="flex-shrink-0 p-3 bg-white">
            <a href="#" class="d-flex align-items-center pb-3 mb-3 link-dark text-decoration-none border-bottom">
                <span class="fs-5 fw-semibold">질의 결과</span>
            </a>
        </div>

        <div id="response-area" class="container-fluid">
            <div class="row">
                <div class="col">
                    <ResponseGrid/>
                </div>
                <div class="col">
                    <ResponseChart/>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
import RequestForm from '@/components/RequestForm'
import ResponseGrid from "@/components/ResponseGrid";
import ResponseChart from "@/components/ResponseChart";

export default {
    components: {
        ResponseChart: ResponseChart,
        ResponseGrid: ResponseGrid,
        RequestData: RequestForm
    },
};
</script>

<style scoped>

main {
    margin-left: 100px;
    margin-right: 100px;
    margin-bottom: 100px;
}

#label-response {
    width: 280px;
}

#response-area {
    margin-left: 10px;
    margin-bottom: 100px;
}
</style>
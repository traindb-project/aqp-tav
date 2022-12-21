<template>
    <ul class="nav nav-tabs" id="chartTab" role="tablist" style="margin-bottom: 20px">
        <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold active" id="chart-tab-0" data-bs-toggle="tab"
                    data-bs-target="#chart-content-0" type="button" role="tab"
                    aria-controls="chart-content-0" aria-selected="true">산점도
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold" id="chart-tab-1" data-bs-toggle="tab"
                    data-bs-target="#chart-content-1" type="button" role="tab"
                    aria-controls="chart-content-1" aria-selected="false">파이차트
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold" id="chart-tab-2" data-bs-toggle="tab"
                    data-bs-target="#chart-content-2" type="button" role="tab"
                    aria-controls="chart-content-3" aria-selected="false">히스토그램
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold" id="chart-tab-3" data-bs-toggle="tab"
                    data-bs-target="#chart-content-3" type="button" role="tab"
                    aria-controls="chart-content-4" aria-selected="false">트리맵
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold" id="chart-tab-4" data-bs-toggle="tab"
                    data-bs-target="#chart-content-4" type="button" role="tab"
                    aria-controls="chart-content-5" aria-selected="false">3차원그래프
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold" id="chart-tab-5" data-bs-toggle="tab"
                    data-bs-target="#chart-content-5" type="button" role="tab"
                    aria-controls="chart-content-6" aria-selected="false">연결그래프
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold" id="chart-tab-6" data-bs-toggle="tab"
                    data-bs-target="#chart-content-6" type="button" role="tab"
                    aria-controls="chart-content-7" aria-selected="false">박스플롯
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold" id="chart-tab-7" data-bs-toggle="tab"
                    data-bs-target="#chart-content-7" type="button" role="tab"
                    aria-controls="chart-content-8" aria-selected="false">지도연계
            </button>
        </li>
    </ul>

</template>

<script>
export default {
    name: "ResponseChart",
}
</script>

<style scoped>

</style>
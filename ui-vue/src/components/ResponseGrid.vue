<template>
    <!--region 그리드 탭-->
    <ul class="nav nav-tabs" id="gridTab" role="tablist">
        <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold active" id="grid-tab-0" data-bs-toggle="tab"
                    data-bs-target="#grid-content-0" type="button" role="tab" aria-controls="grid-content-0"
                    aria-selected="true">스프레드시트
            </button>
        </li>
        <li class="nav-item" role="presentation">
            <button class="nav-link fw-bold" id="grid-tab-1" data-bs-toggle="tab"
                    data-bs-target="#grid-content-1" type="button" role="tab" aria-controls="grid-content-1"
                    aria-selected="false">피벗 그리드
            </button>
        </li>
    </ul>
    <!--endregion 그리드 탭-->
    <!--region 그리드 컨텐츠-->
    <div class="tab-content" id="gridTabContent">
        <div class="tab-pane fade show active overflow-auto" id="grid-content-0" role="tabpanel"
             aria-labelledby="grid-tab-0" tabindex="0">
            <div id="spreadsheet" ref="spreadsheet"/>
        </div>

        <div class="tab-pane fade" id="grid-content-1" role="tabpanel" aria-labelledby="grid-tab-1"
             tabindex="1">
            <div id="root"></div>
        </div>
    </div>
    <!--endregion 그리드-->
</template>

<script>
import jspreadsheet from 'jspreadsheet-ce'

export default {
    name: "ResponseGrid",
    created() {
        this.emitter.on('updated_spreadsheet', (query_result) => {
            let tmp = []
            for (let name of query_result.names){
                tmp.push({
                    'title':name,
                    'width':120
                })
            }
            if (document.getElementsByClassName('jexcel_toolbar').length > 0){
                document.getElementsByClassName('jexcel_toolbar')[0].remove()
                document.getElementsByClassName('jexcel_content')[0].remove()
                document.getElementsByClassName('jexcel_pagination')[0].remove()
                document.getElementsByClassName('jexcel_contextmenu jcontextmenu')[0].remove()
                document.getElementsByClassName('jexcel_about')[0].remove()
            }
            jspreadsheet(document.getElementById('grid-content-0'), {
                data: query_result.datas,
                columns: tmp,
            });
        })
    }
}
</script>

<style scoped>

ul {
    margin-bottom: 20px;
}

#grid-content-0 {
    max-width: 700px;
    max-height: 700px
}

#grid-content-1 {
    max-width: 700px;
    max-height: 700px
}

</style>
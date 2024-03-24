<template>
  <div>
    <div style="width: 100px;">
      <button class="btn btn-success" type="button" @click="onSearchButton">조회</button>
      <button class="btn btn-outline-success" type="button" @click="insertRow">행추가</button>
      <button class="btn btn-danger" type="button" @click="deleteRow">행삭제</button>
      <button class="btn btn-primary" type="button" @click="insertData">저장</button>
<!--      <button class="btn btn-primary" type="button" @click="updateData">업데이트</button>-->
    </div>
    <div ref="table" style="margin: 30px;"></div>
  </div>
  <div style="margin-top: 15px">
    <button class="btn btn-primary" type="button" @click="test">체크된 대이터</button><br/>
  {{ checkedData }}
  </div>
  <div style="margin-top: 15px">
  업데이트<br/>
  {{ updatedData }}
  </div>
  <div style="margin-top: 15px">추가 <br/>
  {{ insertedData }}</div>
  <div style="margin-top: 15px">전체 <br/>
    {{ searchList}}</div>

</template>

<script>
import ApiService from "@/service/ApiService";
import {TabulatorFull as Tabulator} from "tabulator-tables";
import 'tabulator-tables/dist/css/tabulator.min.css'

export default {
  name: 'App',
  data() {
    return {
      tabulator : null, // tabulator 정의를 위해
      insertedData : [], // 인서트 된 행의 데이터를 담기 위해
      updatedData : [], // 업데이트 된 행의 데이터를 담기 이해
      checkedData : [], // 체크된 행의 데이터를 담기 위해
      searchList : [{ // 넥사크로의 데이터셋과 비슷함
        seq : "", // 넥사크로의 해당 데이터셋의 칼럼명. 명시를 안해도 되지만, 대다수가 유지보수를 위해 명시를 하고 있음. // 번호
        index : "", // 인덱스번호
        name : "", // 이름 (한글 칼럼명도 명시)
        tel : "", // 전화번호
        gender : "" // 성별
      }]
    }
  },
  methods : { // 넥사크로 function 처럼 정의하기
    onSearchButton() {
      this.loadGrid();
      this.updatedData = [];
      this.checkedData = [];
      this.insertedData = [];
    },
    test() {
      this.checkedData = this.tabulator.getSelectedData();
    },
    async deleteRow() {
      // 선택된 데이터를 찾음
      this.checkedData = this.tabulator.getSelectedData();

      if(!this.checkedData || this.checkedData.length === 0) { return null } // 비었으면 작동을 안하게 함

      try {
        const response = await ApiService.deleteData(this.checkedData);
        alert(response.data);
      } catch (error){
        alert(error.data);
        return null;
      }

      const checkedDataSet = new Set(this.checkedData.map(JSON.stringify));

      //  searchList, insertedData와 updatedData에 각각 갱신
      const filterFn = listItem => !checkedDataSet.has(JSON.stringify(listItem));
      this.searchList = this.searchList.filter(filterFn);
      this.insertedData = this.insertedData.filter(filterFn);
      this.updatedData = this.updatedData.filter(filterFn);

      // searchList는 index 이용하므로 다시 갱신
      this.searchList.forEach((list, index) => {
        list.index = index+1;
      });

      // 바뀐 데이터를 다시 삽입
      this.tabulator.replaceData(this.searchList);

      // 체크된 데이터는 적용 후 비어 있어야 하므로
      this.checkedData = [];
    },
    insertRow() {
      const newRowData = { index: this.searchList.length + 1 };
      this.insertedData.push(newRowData);
      this.tabulator.addRow(newRowData);
      this.searchList = [...this.searchList, newRowData];
      this.tabulator.replaceData( this.searchList);
    },
    async insertData() {
      // if(!this.insertedData || this.insertedData.length === 0) { return null } // 비었으면 작동을 안하게 함
      if(!this.updatedData || this.updatedData.length === 0) { return null } // 비었으면 작동을 안하게 함
      try {
          // const response = await ApiService.insertData(this.insertedData);
        const response = await ApiService.duplicatedData(this.updatedData);
          alert(response.data);
          this.updatedData = [];
      }catch (error){
          alert(error.response.data);
      }
    },
    // async updateData() {
    //   if(!this.updatedData || this.updatedData.length === 0) { return null } // 비었으면 작동을 안하게 함
    //   try {
    //     const response = await ApiService.updateData(this.updatedData);
    //     alert(response.data);
    //     this.updatedData = [];
    //   }catch (error){
    //     alert(error.response.data);
    //   }
    // },
    async getLoadList() { // 데이터 불러오기
      try {
        const response = await ApiService.loadSearchList();
        this.searchList = response.data.searchList;

        this.searchList.forEach((list, index) => { // 데이터베이스 상의 번호가 아닌 인덱스 번호가 필요할때
          list.index = index+1;
        });

      }catch (error) {
        alert("데이터를 불러오는데 실패함");
      }
    },
    async loadGrid() {
      await this.getLoadList(); // 콜백함수 처럼 사용

      this.tabulator = new Tabulator(this.$refs.table, {
        data: this.searchList,
        layout: "fitColumns",
        reactiveData: true,
        selectable: true,
        rowHeader:
            { // 체크박스 추가시
              headerSort:false, resizable: false, width: 40,
              headerHozAlign:"center", hozAlign:"center",
              formatter:"rowSelection", titleFormatter:"rowSelection",
            },
        columns : [ // 칼럼들 정의. filed는 반드시 데이터셋의 칼럼명과 일치해야함.
          { title : "번호", field : "index" },
          { title : "이름", field : "name", editor : "input" },
          { title : "전화번호", field: "tel", editor: "input" },
          { title : "성별", field: "gender", editor: "list", editorParams : {values:{ "남":"남", "여":"여", "혼성":"혼성" }} }
        ],
      });

      this.tabulator.on("cellEdited", (cell) => {
        let editedRow = cell.getRow().getData(); // 수정된 로우의 데이터를 구함

        let index = this.updatedData.findIndex((item) => item.index === editedRow.index); // 배열 index가 같은것을 찾음.

        if (index !== -1) {
          // 업데이트된 데이터를 updatedData 에 반영
          this.updatedData[index] = editedRow;
        } else {
          // 새롭게 업데이트된 데이터를 추가
          this.updatedData.push(editedRow);
        }
      });
    }
  },
  mounted() { // _onload 랑 비슷함
    this.loadGrid(); // 그리드부터 부르고
  },
}
</script>

<style lang="css" scoped>
@import url('@/assets/bootstrap.min.css');

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
import axios from 'axios';

const API_IRL = 'http://localhost:8080';

export default {
    loadSearchList() {
        return axios.get(API_IRL + "/seUser/searchList")
    },
    insertData(insertDatas){
        return axios.post(API_IRL+"/seUser/insertData", insertDatas);
    },
    updateData(updateDatas){
        return axios.post(API_IRL+"/seUser/updateData", updateDatas);
    },
    deleteData(deleteDatas){
        return axios.post(API_IRL+"/seUser/deleteData", deleteDatas);
    },
    duplicatedData(duplicatedData){
        return axios.post(API_IRL+"/seUser/duplicateTest", duplicatedData);
    }
}
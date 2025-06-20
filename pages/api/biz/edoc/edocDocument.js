`use strict`

import logger from "../../winston/logger"
import * as constants from '@/components/constants'
import * as database from "../database/database"
import * as dynamicSql from '../dynamicSql'

const executeService = async (txnId, jRequest) => {
    var jResponse = {};

    try {
        switch (jRequest.commandName) {
            case constants.commands.COMMAND_EDOC_DOCUMENT_UPSERT_ONE:
                jResponse = await upsertOne(txnId, jRequest);
                break;
            case constants.commands.COMMAND_EDOC_DOCUMENT_SELECT_ONE:
                jResponse = await selectOne(txnId, jRequest);
                break;
            case constants.commands.COMMAND_EDOC_DOCUMENT_DELETE_ONE:
                jResponse = await deleteOne(txnId, jRequest);
                break;
            default:
                break;
        }
    } catch (error) {
        logger.error(`message:${error.message}\n stack:${error.stack}\n`);
    } finally {
        return jResponse;
    }
}


const upsertOne = async (txnId, jRequest) => {
    var jResponse = {};
    var isInsert = null; 
    
    try {
        jResponse.commanaName = jRequest.commandName;

        if (!jRequest.documentData) {  
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [documentData]`;
            return jResponse;
        }
        
        if (!jRequest.documentData.id) {
            jRequest.documentData.id = generateUUID();

            if (!jRequest.documentData.title)
                jRequest.documentData.title ="new document";
         
            if (!jRequest.documentData.description)
                jRequest.documentData.description = "new document";
            
            isInsert = true; // insert
        }
        else {
            isInsert = false; // update
        }

        if (!jRequest.documentData.title) {
            jRequest.documentData.title = constants.messages.EMPTY_STRING;
        }
        if (!jRequest.documentData.components) {
            jRequest.documentData.components = [];
        }
        
        if(isInsert){
            // insert TB_DOC_DOCUMENT
            var sql = null
            sql = await dynamicSql.getSQL00('insert_TB_DOC_DOCUMENT', 1);
            var insert_TB_DOC_DOCUMENT = await database.executeSQL(sql,
                [
                    jRequest.systemCode,
                    jRequest.documentData.id,
                    jRequest.documentData.title,
                    jRequest.documentData.description,
                    1, // version
                    jRequest.userId, // user id 
                    jRequest.documentData.runtime_data
                ]);

            if (insert_TB_DOC_DOCUMENT.rowCount != 1) {
                jResponse.error_code = 0;
                jResponse.error_message = constants.messages.MESSAGE_FAILE_TO_SAVE;
                return jResponse;
            }
        }
        else {
            // update TB_DOC_DOCUMENT
            var sql = null
            sql = await dynamicSql.getSQL00('update_TB_DOC_DOCUMENT', 1);
            var update_TB_DOC_DOCUMENT = await database.executeSQL(sql,
                [
                    jRequest.systemCode,
                    jRequest.documentData.id,
                    jRequest.documentData.title,
                    jRequest.documentData.description,
                    jRequest.userId,
                    jRequest.documentData.runtime_data
                ]);

            if (update_TB_DOC_DOCUMENT.rowCount != 1) {
                jResponse.error_code = -1;
                jResponse.error_message = constants.messages.MESSAGE_FAILE_TO_SAVE;
                return jResponse;
            }

            // delete existing components
            sql = await dynamicSql.getSQL00('delete_TB_DOC_DOCUMENT_COMPONENT_MAP_BY_DOCUMENT_ID', 1);
            var delete_TB_DOC_DOCUMENT_COMPONENT_MAP_BY_DOCUMENT_ID = await database.executeSQL(sql,
                [
                    jRequest.systemCode,
                    jRequest.documentData.id
                ]);
        }
        
        // insert TB_DOC_COMPONENT
        sql = await dynamicSql.getSQL00('insert_TB_DOC_DOCUMENT_COMPONENT_MAP', 1);
        var position = 0; // position of component
        for (let component of jRequest.documentData.components) {

            var insert_TB_DOC_DOCUMENT_COMPONENT_MAP = await database.executeSQL(sql,
                [
                    jRequest.systemCode,
                    jRequest.documentData.id, // document id
                    position++,
                    component.id, // component id
                    component.runtime_data ? component.runtime_data : {} // runtime data
                ]);
            if (insert_TB_DOC_DOCUMENT_COMPONENT_MAP.rowCount != 1) {
                jResponse.error_code = -1;
                jResponse.error_message = constants.messages.MESSAGE_FAILE_TO_SAVE;
                return jResponse;
            }
        }

        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.MESSAGE_SUCCESS_SAVED;
        jResponse.documentData = jRequest.documentData; // return saved document data
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

const selectOne = async (txnId, jRequest) => {
    var jResponse = {};
    
    try {
        jResponse.commanaName = jRequest.commandName;
        
        if (!jRequest.documentId) {
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [documentData.id]`;
            return jResponse;
        }

        // insert TB_DOC_DOCUMENT
        var sql = null
        sql = await dynamicSql.getSQL00('select_TB_DOC_DOCUMENT', 1);
        var select_TB_DOC_DOCUMENT = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.documentId     
            ]);

        if (select_TB_DOC_DOCUMENT.rowCount < 1) {
            jResponse.error_code = 0;
            jResponse.error_message = constants.messages.MESSAGE_NO_DATA_FOUND;
            return jResponse;
        }

        var documentData = {};
        documentData.id = select_TB_DOC_DOCUMENT.rows[0].id;
        documentData.title = select_TB_DOC_DOCUMENT.rows[0].title;
        documentData.description = select_TB_DOC_DOCUMENT.rows[0].description;
        documentData.components = [];
                   // delete existing components
        sql = await dynamicSql.getSQL00('select_TB_DOC_DOCUMENT_COMPONENT_MAP_BY_DOCUMENT_ID', 1);
        var select_TB_DOC_DOCUMENT_COMPONENT_MAP_BY_DOCUMENT_ID = await database.executeSQL(sql,
            [
                jRequest.systemCode,
                jRequest.documentId
            ]);

        select_TB_DOC_DOCUMENT_COMPONENT_MAP_BY_DOCUMENT_ID.rows.forEach(row => {       
            var component = {};
            component.id = row.component_template_id;
            component.type = row.template_json.type;
            component.position = row.position;
            component.template_json = row.template_json;
            component.runtime_data = row.runtime_data;
            documentData.components.push(component);
        }
        );
        
        jResponse.documentData = documentData; // return saved document data    
        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.EMPTY_STRING; 
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message;
    } finally {
        return jResponse;
    }
};

const deleteOne = async (txnId, jRequest) => {
    var jResponse = {};
    var isInsert = null; 
    
    try {
        jResponse.commanaName = jRequest.commandName;

        if (!jRequest.documentId) {  
            jResponse.error_code = -2;
            jResponse.error_message = `${constants.messages.MESSAGE_REQUIRED_FIELD} [documentId]`;
            return jResponse;
        }
        
        // insert TB_DOC_DOCUMENT
        var sql = null
        sql = await dynamicSql.getSQL00('delete_TB_DOC_DOCUMENT', 1);
        var delete_TB_DOC_DOCUMENT = await database.executeSQL(sql,
        [
                jRequest.systemCode,
                jRequest.documentId     
        ]);

        sql = await dynamicSql.getSQL00('delete_TB_DOC_DOCUMENT_COMPONENT_MAP_BY_DOCUMENT_ID', 1);
        
        var delete_TB_DOC_DOCUMENT_COMPONENT_MAP_BY_DOCUMENT_ID = await database.executeSQL(sql,
        [
                jRequest.systemCode,
                jRequest.documentId     
        ]);

        jResponse.error_code = 0;
        jResponse.error_message = constants.messages.MESSAGE_SUCCESS_DELETED;
        jResponse.documentData = jRequest.documentData; // return saved document data
    } catch (e) {
        logger.error(e);
        jResponse.error_code = -1; // exception
        jResponse.error_message = e.message
    } finally {
        return jResponse;
    }
};

export { executeService };
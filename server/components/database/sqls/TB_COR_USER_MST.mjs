`use strict`

export const select_DB_COR_USER_MST_01 = 
`SELECT SYSTEM_CODE, USER_ID, PASSWORD, USER_NAME
  FROM brunner.tb_cor_user_mst
 WHERE USER_ID = ?`
 ;

 export const update_DB_COR_USER_MST_01 = 
 `UPDATE brunner.tb_cor_user_mst 
     SET PASSWORD = ?
   WHERE USER_ID = ?
     AND REGISTER_NO = ?
     AND PHONE_NUMBER = ?
     AND PASSWORD != ?
   `
  ;

  export const insert_DB_COR_USER_MST_01 = 
  `INSERT INTO brunner.tb_cor_user_mst
    (SYSTEM_CODE, USER_ID, PASSWORD, USER_NAME, AUTHORITY_GROUP_ID, 
     ADDRESS, PHONE_NUMBER, EMAIL_ID, REGISTER_NO, REGISTER_NAME,
     SALES_TYPE, SALES_CATEGORY, USE_FLAG, CREATE_USER_ID, CREATE_TIME, 
     UPDATE_USER_ID, UPDATE_TIME)
   VALUES
    (?, ?, ?, ?, ?,
     ?, ?, ?, ?, ?,
     ?, ?, ?, ?, SYSDATE(),
     NULL, NULL)
    `
   ;  
export const select_DB_COR_USER_MST_01 = 
`SELECT SYSTEM_CODE, USER_ID, PASSWORD, USER_NAME
  FROM brunner.tb_cor_user_mst
 WHERE USER_ID=?`
 ;


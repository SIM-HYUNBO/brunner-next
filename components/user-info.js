
export default function UserInfo(){

    // userInfo : 현재값 가져오기 getter
    // setUserInfo : 현재값 바꾸기 setter
    return (
        <>
          <p className="ml-1 mr-5 text-gray-600 dark:text-gray-400">
            {process.env.userInfo == undefined || process.env.userInfo.USER_NAME == undefined ? '': `${process.env.userInfo.USER_NAME}님`}
          </p>
        </>
    );
}
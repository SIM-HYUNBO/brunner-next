import SignoutButton from "./signout-button";

export default function UserInfo(){

    // userInfo : 현재값 가져오기 getter
    // setUserInfo : 현재값 바꾸기 setter
    return (
        <>
        {process.env.userInfo.USER_NAME &&
          <p className="ml-3 mr-1 text-gray-600 dark:text-gray-400">
            {`${process.env.userInfo.USER_NAME}님`}
          </p>}
          <SignoutButton />
        </>
    );
}
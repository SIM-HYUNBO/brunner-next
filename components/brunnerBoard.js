`use strict`;

import React, { useState, useEffect } from "react";
import RequestServer from "@/components/requestServer";
import * as userInfo from "@/components/userInfo";
import { useModal } from "@/components/brunnerMessageBox";
import * as constants from "@/components/constants";
import Loading from "@/components/loading";

function BrunnerBoard({ boardType }) {
  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal } = useModal();
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState("");

  // 게시글 목록 조회
  const fetchPosts = async () => {
    try {
      const jRequest = {
        commandName: constants.commands.POST_INFO_SELECT_ALL,
        systemCode: process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE,
        postInfo: { postType: boardType }
      };
      // setLoading(true);
      const jResponse = await RequestServer(jRequest);
      // setLoading(false);

      if (jResponse.error_code === 0) {
        setPosts(jResponse.postList);
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      setLoading(false);
      openModal(error.message);
    }
  };

  useEffect(() => {
    if (boardType) {
      fetchPosts();
    }
  }, [boardType]);

  const handlePostChange = (e) => {
    setPostText(e.target.value);
  };

  // 2. 게시글 작성 */
  const handleAddPost = async () => {
    try {
      if (postText.trim()) {
        var jRequest = {};
        var jResponse = null;

        const userId = userInfo.getLoginUserId();
        const postType = `${boardType}`;

        const newPost = {
          postType: postType,
          content: postText,
          userId: userId,
        };

        jRequest.commandName = constants.commands.POST_INFO_INSERT_ONE;
        jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
        jRequest.postInfo = newPost;

        setLoading(true);// 데이터 로딩 시작
        jResponse = await RequestServer(jRequest);
        setLoading(false);// 데이터 로딩 끝

        if (jResponse.error_code === 0) {
          setPosts([jResponse.postInfo, ...posts]);
          setPostText("");
        } else {
          openModal(jResponse.error_message);
        }
      }
    } catch (error) {
      setLoading(false);
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  // 3. 게시글 편집 후 저장 */
  const handleEditPost = async (postId, newContent) => {
    try {
      var jRequest = {};
      var jResponse = null;

      const userId = userInfo.getLoginUserId();
      if (!userId) {
        openModal(constants.messages.NO_PERMISSION);
        return;
      }

      jRequest.commandName = constants.commands.POST_INFO_UPDATE_ONE;
      jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
      jRequest.postInfo = {
        postId: postId,
        content: newContent,
        userId: userId,
      };

      setLoading(true);// 데이터 로딩 시작
      jResponse = await RequestServer(jRequest);
      setLoading(false);// 데이터 로딩 끝

      if (jResponse.error_code === 0) {
        const updatedPosts = posts.map((post) =>
          post.post_id === postId
            ? {
              ...post,
              post_content: newContent,
              update_user_id: userId,
            }
            : post
        );
        setPosts(updatedPosts);
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      setLoading(false);
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  // 4. 게시글 삭제 */
  const handleDeletePost = async (postId) => {
    try {
      var jRequest = {};
      var jResponse = null;

      const userId = userInfo.getLoginUserId();
      if (!userId) {
        openModal(constants.messages.NO_PERMISSION);
        return;
      }

      jRequest.commandName = constants.commands.POST_INFO_DELETE_ONE;
      jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;

      jRequest.postInfo = {
        postId: postId,
        userId: userId,
      };

      setLoading(true);// 데이터 로딩 시작작
      jResponse = await RequestServer(jRequest);
      setLoading(false);// 데이터 로딩 끝

      if (jResponse.error_code === 0) {
        const updatedPosts = posts.filter((post) => post.post_id !== postId);
        setPosts(updatedPosts);
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      setLoading(false);
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  // 5. 댓글 저장 */
  const handleAddComment = async (postId, commentText) => {
    try {
      var jRequest = {};
      var jResponse = null;

      const userId = userInfo.getLoginUserId();

      jRequest.commandName = constants.commands.POST_COMMENT_INFO_INSERT_ONE;
      jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;

      jRequest.commentInfo = {
        postId: postId,
        content: commentText,
        userId: userId,
      };

      jResponse = await RequestServer(jRequest);

      if (jResponse.error_code === 0) {
        const updatedPosts = posts.map((post) => {
          if (post.post_id === postId) {
            return {
              ...post,
              comments: [...post.comments, jResponse.commentInfo],
            };
          }
          return post;
        });
        setPosts(updatedPosts);
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  // 6. 댓글 편집 후 저장
  const handleEditComment = async (postId, commentId, newContent) => {
    try {
      var jRequest = {};
      var jResponse = null;

      const userId = userInfo.getLoginUserId();
      if (!userId) {
        openModal(constants.messages.NO_PERMISSION);
        return;
      }

      const post = posts.find((post) => post.post_id === postId);

      jRequest.commandName = constants.commands.POST_COMMENT_INFO_UPDATE_ONE;
      jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
      jRequest.commentInfo = {
        postId: postId,
        commentId: commentId,
        content: newContent,
        userId: userId,
      };

      jResponse = await RequestServer(jRequest);

      if (jResponse.error_code === 0) {
        const updatedPosts = posts.map((post) => {
          if (post.post_id === postId) {
            const updatedComments = post.comments?.map((comment, index) =>
              comment.comment_id === commentId
                ? { ...comment, comment_content: newContent }
                : comment
            );
            return { ...post, comments: updatedComments };
          }
          return post;
        });
        setPosts(updatedPosts);
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      openModal(error.message);
      console.error(`message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  // 7. 댓글 삭제
  const handleDeleteComment = async (postId, commentId) => {
    try {
      var jRequest = {};
      var jResponse = null;

      const userId = userInfo.getLoginUserId();
      if (!userId) {
        openModal(constants.messages.NO_PERMISSION);
        return;
      }

      jRequest.commandName = constants.commands.POST_COMMENT_INFO_DELETE_ONE;
      jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;

      jRequest.commentInfo = {
        postId: postId,
        commentId: commentId,
        userId: userId,
      };

      jResponse = await RequestServer(jRequest);

      if (jResponse.error_code === 0) {
        const updatedPosts = posts.map((post) => {
          if (post.post_id === postId) {
            const updatedComments = post.comments.filter(
              (_, index) => index !== commentId
            );
            return { ...post, comments: updatedComments };
          }
          return post;
        });
        setPosts(updatedPosts);
      } else {
        openModal(jResponse.error_message);
      }
    } catch (error) {
      console.error(`Error deleting comment: message:${error.message}\n stack:${error.stack}\n`);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto`}>
      <BrunnerMessageBox />
      {loading && (
        <Loading />
      )}
      <div className={`mb-6 flex`}>
        <textarea
          value={postText}
          onChange={handlePostChange}
          placeholder="Write new post..."
          maxLength="1000"
          className={`w-full 
                      p-2 
                      border 
                      border-gray-300 
                      rounded-md 
                      medium-text-color`}
        />
        <button
          onClick={handleAddPost}
          className={`mt-2 px-4 py-2 bg-green-500 text-white rounded-md ml-2 justify-end`}
        >
          Post
        </button>
      </div>
      <div className={`post-list`}>
        {posts.map((post) => (
          <BoardContent
            key={post.post_id}
            post={post}
            onAddComment={handleAddComment}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
          />
        ))}
      </div>
    </div>
  );
}

/* 게시글 컴포넌트

* 데이터 모델

post.post_id : String (일련번호)
post.create_user_id : String
post.post_content : String
post.create_time : Date
post.comments : JsonArray of JsonObject 

comment.comment_id:  : String (일련번호)
comment.create_user_id
comment.comment_content
comment.create_time
*/

function BoardContent({
  post,
  onAddComment,
  onEditPost,
  onDeletePost,
  onEditComment,
  onDeleteComment,
}) {
  // 로딩 & 메시지 박스
  // {
  const [loading, setLoading] = useState(false);
  const { BrunnerMessageBox, openModal } = useModal();
  const [commentText, setCommentText] = useState("");
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editedPostText, setEditedPostText] = useState(post.post_content);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(post.post_id, commentText);
      setCommentText("");
    }
  };

  const handleEditPostChange = (e) => {
    setEditedPostText(e.target.value);
  };

  const handleEditPost = () => {
    onEditPost(post.post_id, editedPostText);
    setIsEditingPost(false);
  };

  const handleDeletePost = () => {
    onDeletePost(post.post_id);
  };

  const handleEditCommentChange = (e) => {
    setEditedCommentText(e.target.value);
  };

  const handleEditComment = (commentId) => {
    onEditComment(post.post_id, commentId, editedCommentText);
    setEditingCommentId(null);
  };

  const handleDeleteComment = (commentId) => {
    onDeleteComment(post.post_id, commentId);
  };

  return (
    <div className={`border-b border-gray-300 py-4`}>
      <BrunnerMessageBox />
      <hr />
      {loading && (
        <Loading />
      )}
      {isEditingPost ? (
        <div>
          <textarea
            value={editedPostText}
            onChange={handleEditPostChange}
            className={`w-full 
                        p-2 
                        border 
                        border-gray-300 
                        rounded-md 
                        text-slate-600 
                        dark:text-slate-400`}
          />
          <button
            onClick={handleEditPost}
            className={`mt-2 
                        px-4 
                        py-2 
                        bg-blue-500 
                        text-slate-400 
                        rounded-md`}
          >
            Save
          </button>
          <button
            onClick={() => setIsEditingPost(false)}
            className={`mt-2 ml-2 px-4 py-2 bg-gray-500 text-white rounded-md`}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className={`w-full text-left`}>
          <strong className={`text-left text-sm`}>{post.create_user_id}</strong>
          <span className={`text-gray-400 ml-2 text-xs`}>
            {new Date(post.create_time).toLocaleString()}
          </span>
          <br />
          <p className={`w-full text-left`}>{post.post_content}</p>
        </div>
      )}
      <div className={`flex mt-2`}>
        {!isEditingPost && (
          <>
            <button
              onClick={() => {
                const userId = userInfo.getLoginUserId();
                if (!userId) {
                  openModal(constants.messages.NO_PERMISSION);
                  return;
                }
                setIsEditingPost(true);
              }}
              
              className={`px-1
                          bg-yellow-500 
                          text-white 
                          rounded-md`}
            >
              {/* 연필아이콘 */}
            <svg
             xmlns="http://www.w3.org/2000/svg"
             className="w-3 h-3"
             fill="none"
             viewBox="0 0 24 24"
             stroke="currentColor"
             strokeWidth={2}
            >
              <path
               strokeLinecap="round"
               strokeLinejoin="round"
               d="M16.862 4.487l2.651 2.651a2 2 0 010 2.828l-9.9 9.9a4 4 0 01-1.414.94l-3.53 1.178a.5.5 0 01-.633-.633l1.178-3.53a4 4 0 01.94-1.414l9.9-9.9a2 2 0 012.828 0z"
              />
            </svg>
            </button>
            <button
              onClick={() => {
                const userId = userInfo.getLoginUserId();
                if (!userId) {
                  openModal(constants.messages.NO_PERMISSION);
                  return;
                }
                handleDeletePost();
              }}
              className={`px-2
                          bg-red-500 
                          text-white 
                          rounded-md`}
            >
             - 
            </button>
          </>
        )}
      </div>
      <div className={`ml-5 mt-2`}>
        {post.comments?.map((comment, index) => (
          <div key={index} className={`ml-1 mb-2`}>
            {editingCommentId === comment.comment_id ? (
              <div>
                <input
                  type="text"
                  value={editedCommentText}
                  onChange={handleEditCommentChange}
                  className={`w-full 
                              p-1 
                              border 
                              border-gray-300 
                              rounded-md`}
                />
                <button
                  onClick={() => handleEditComment(comment.comment_id)}
                  className={`mt-2 
                              p-1 
                              bg-blue-500 
                              text-white 
                              rounded-md`}
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingCommentId(null)}
                  className={`mt-2 
                              ml-1 
                              p-1 
                              bg-gray-500 
                              text-white 
                              rounded-md`}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className={`w-full text-left`}>
                <strong className={`text-left text-sm`}>
                  {comment.create_user_id}
                </strong>
                <span className={`text-gray-400 ml-2 text-xs`}>
                  {new Date(comment.create_time).toLocaleString()}
                </span>
                <br />
                <p className={`w-full text-left`}>{comment.comment_content}</p>
              </div>
            )}
            <div className={`flex mt-1`}>
              {editingCommentId !== comment.comment_id && (
                <>
                  <button
                    onClick={() => {
                      const userId = userInfo.getLoginUserId();
                      if (!userId) {
                        openModal(constants.messages.NO_PERMISSION);
                        return;
                      }
                      setEditingCommentId(comment.comment_id);
                      setEditedCommentText(comment.comment_content);
                    }}
                    className={`px-1
                                bg-yellow-500 
                                text-white 
                                rounded-md`}
                  >
                    {/* 연필아이콘 */}
                   <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    >
                      <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.862 4.487l2.651 2.651a2 2 0 010 2.828l-9.9 9.9a4 4 0 01-1.414.94l-3.53 1.178a.5.5 0 01-.633-.633l1.178-3.53a4 4 0 01.94-1.414l9.9-9.9a2 2 0 012.828 0z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const userId = userInfo.getLoginUserId();
                      if (!userId) {
                        openModal(constants.messages.NO_PERMISSION);
                        return;
                      }
                      handleDeleteComment(comment.comment_id);
                    }}
                    className={`px-2
                                bg-red-500 
                                text-white 
                                rounded-md`}
                  >
                   - 
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className={`flex mt-2`}>
        <input
          type="text"
          value={commentText}
          onChange={handleCommentChange}
          placeholder="Write new comment."
          className={`flex-1 
                      p-1
                      border 
                      border-gray-300 
                      rounded-md 
                      medium-text-color`}
        />
        <button
          onClick={handleAddComment}
          className={`ml-1 
                      p-1 
                      bg-blue-500 
                      text-white 
                      rounded-md`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export default BrunnerBoard;

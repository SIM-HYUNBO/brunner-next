import React, { useState, useEffect } from 'react';
import requestServer from '@/components/requestServer';
import * as userInfo from '@/components/userInfo';
import BrunnerMessageBox from '@/components/BrunnerMessageBox';

// 게시글 컴포넌트
function BoardContent({ post, onAddComment, onEditPost, onDeletePost, onEditComment, onDeleteComment }) {
    const [loading, setLoading] = useState(false); // 로딩 상태 추가
    const [modalContent, setModalContent] = useState({
        isOpen: false,
        message: '',
        onConfirm: () => { },
        onClose: () => { }
    });

    // 모달 열기 함수
    const openModal = (message) => {
        return new Promise((resolve, reject) => {
            setModalContent({
                isOpen: true,
                message: message,
                onConfirm: (result) => { resolve(result); closeModal(); },
                onClose: () => { reject(false); closeModal(); }
            });
        });
    };

    // 모달 닫기 함수
    const closeModal = () => {
        setModalContent({
            isOpen: false,
            message: '',
            onConfirm: () => { },
            onClose: () => { }
        });
    };
    const [commentText, setCommentText] = useState('');
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editedPostText, setEditedPostText] = useState(post.post_content);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedCommentText, setEditedCommentText] = useState('');

    const handleCommentChange = (e) => {
        setCommentText(e.target.value);
    };

    const handleAddComment = () => {
        if (commentText.trim()) {
            onAddComment(post.post_id, commentText);
            setCommentText('');
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
        <div className="border-b border-gray-300 py-4">
            {loading && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            )}
            <BrunnerMessageBox
                isOpen={modalContent.isOpen}
                message={modalContent.message}
                onConfirm={modalContent.onConfirm}
                onClose={modalContent.onClose}
            />
            {isEditingPost ? (
                <div>
                    <textarea
                        value={editedPostText}
                        onChange={handleEditPostChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <button onClick={handleEditPost} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">
                        Save
                    </button>
                    <button onClick={() => setIsEditingPost(false)} className="mt-2 ml-2 px-4 py-2 bg-gray-500 text-white rounded-md">
                        Cancel
                    </button>
                </div>
            ) : (
                <p>
                    <strong className="text-left">{post.create_user_id}</strong>
                    <br />
                    <span className="text-gray-500 text-sm">{new Date(post.create_time).toLocaleString()}</span>
                    <br />
                    <p className='w-full text-left'>{post.post_content}</p>
                </p>
            )}
            <div className="flex mt-2">
                {!isEditingPost && (
                    <>
                        <button onClick={() => {
                            const userId = userInfo.getLoginUserId();
                            if (!userId) {
                                openModal('You do not have permission');
                                return;
                            }
                            setIsEditingPost(true)
                        }} className="mr-2 px-4 py-2 bg-yellow-500 text-white rounded-md">
                            Edit
                        </button>
                        <button onClick={() => {
                            const userId = userInfo.getLoginUserId();
                            if (!userId) {
                                openModal('You do not have permission');
                                return;
                            }
                            handleDeletePost()
                        }} className="px-4 py-2 bg-red-500 text-white rounded-md">
                            Delete
                        </button>
                    </>
                )}
            </div>
            <div className="ml-5 mt-2">
                {post.comments?.map((comment, index) => (
                    <div key={index} className="ml-1 mb-2">
                        {editingCommentId === comment.comment_id ? (
                            <div>
                                <input
                                    type="text"
                                    value={editedCommentText}
                                    onChange={handleEditCommentChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                                <button onClick={() => handleEditComment(comment.comment_id)} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">
                                    Save
                                </button>
                                <button onClick={() => setEditingCommentId(null)} className="mt-2 ml-2 px-4 py-2 bg-gray-500 text-white rounded-md">
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <p>
                                <strong className="text-left">{comment.create_user_id}</strong>
                                <br />
                                <span className="text-gray-500 text-sm text-left">{new Date(comment.create_time).toLocaleString()}</span>
                                <br />
                                <p className="w-full text-left">{comment.comment_content}</p>
                            </p>
                        )}
                        <div className="flex mt-1">
                            {editingCommentId !== comment.comment_id && (
                                <>
                                    <button onClick={() => {
                                        const userId = userInfo.getLoginUserId();
                                        if (!userId) {
                                            openModal('You do not have permission');
                                            return;
                                        }
                                        setEditingCommentId(comment.comment_id);
                                        setEditedCommentText(comment.comment_content);
                                    }} className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded-md">
                                        Edit
                                    </button>
                                    <button onClick={() => {
                                        const userId = userInfo.getLoginUserId();
                                        if (!userId) {
                                            openModal('You do not have permission');
                                            return;
                                        }
                                        handleDeleteComment(comment.comment_id)
                                    }} className="px-3 py-1 bg-red-500 text-white rounded-md">
                                        Delete
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex mt-2">
                <input
                    type="text"
                    value={commentText}
                    onChange={handleCommentChange}
                    placeholder="Input Comment."
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                />
                <button onClick={handleAddComment} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md">
                    Add Comment
                </button>
            </div>
        </div>
    );
}

/* 데이터 모델의 구조

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

// 게시판 컴포넌트
function Board(boardInfo) {
    const [loading, setLoading] = useState(false); // 로딩 상태 추가
    const [modalContent, setModalContent] = useState({
        isOpen: false,
        message: '',
        onConfirm: () => { },
        onClose: () => { }
    });

    // 모달 열기 함수
    const openModal = (message) => {
        return new Promise((resolve, reject) => {
            setModalContent({
                isOpen: true,
                message: message,
                onConfirm: (result) => { resolve(result); closeModal(); },
                onClose: () => { reject(false); closeModal(); }
            });
        });
    };

    // 모달 닫기 함수
    const closeModal = () => {
        setModalContent({
            isOpen: false,
            message: '',
            onConfirm: () => { },
            onClose: () => { }
        });
    };

    const [posts, setPosts] = useState([]);
    const [postText, setPostText] = useState('');
    const [boardType, setTickerCode] = useState(boardInfo.boardType);


    useEffect(() => {
        fetchPosts();
    }, []);

    // 1. 게시글 목록 조회
    const fetchPosts = async () => {

        var jRequest = {};
        var jResponse = null;

        try {
            jRequest.commandName = "post.getPostList";
            jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
            jRequest.postInfo = { postType: `TICKER_INFO-${boardType}` }; // 게시판 유형을 TICKER_INFO-{종모코드}로 함

            setLoading(true); // 데이터 로딩 시작
            jResponse = await requestServer('POST', JSON.stringify(jRequest));
            setLoading(false); // 데이터 로딩 시작

            if (jResponse.error_code === 0) {

                /*
                {
                    system_code
                    post_id
                    post_type
                    post_content
                    create_user_id
                    create_time
                    update_user_id
                    update_time
                    comments[] => 댓글의 배열을 시간의 역순 조회해서 저장
                }
                */

                setPosts(jResponse.postList);
            } else {
                openModal(jResponse.error_message);
            }
        } catch (error) {
            openModal(jResponse.error_message);
        }
    };

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
                const postType = `TICKER_INFO-${boardType}`;

                const newPost = {
                    postType: postType,
                    content: postText,
                    userId: userId ? userId : 'anonymous user',
                };

                jRequest.commandName = "post.addPost";
                jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
                jRequest.postInfo = newPost;

                setLoading(true);
                jResponse = await requestServer('POST', JSON.stringify(jRequest));
                setLoading(false);

                if (jResponse.error_code === 0) {

                    setPosts([jResponse.postInfo, ...posts]);
                    setPostText('');
                } else {
                    openModal(jResponse.error_message);
                }
            }
        } catch (error) {
            openModal(jResponse.error_message);
            setLoading(false);
        }
    };

    // 3. 게시글 편집 후 저장 */
    const handleEditPost = async (postId, newContent) => {
        try {
            var jRequest = {};
            var jResponse = null;

            const userId = userInfo.getLoginUserId();
            if (!userId) {
                openModal('You do not have permission');
                return;
            }

            jRequest.commandName = "post.editPost";
            jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
            jRequest.postInfo = {
                postId: postId,
                content: newContent,
                userId: userId ? userId : 'anonymous user',
            };

            setLoading(true);
            jResponse = await requestServer('POST', JSON.stringify(jRequest));
            setLoading(false);

            if (jResponse.error_code === 0) {
                const updatedPosts = posts.map((post) =>
                    post.post_id === postId ? { ...post, post_content: newContent, update_user_id: userId ? userId : 'anonymous user' } : post
                );
                setPosts(updatedPosts);
            } else {
                openModal(jResponse.error_message);
            }
        } catch (error) {
            setLoading(false);
            openModal(jResponse.error_message);
        }
    };

    // 4. 게시글 삭제 */
    const handleDeletePost = async (postId) => {
        try {
            var jRequest = {};
            var jResponse = null;

            const userId = userInfo.getLoginUserId();
            if (!userId) {
                openModal('You do not have permission');
                return;
            }

            jRequest.commandName = "post.deletePost";
            jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;

            jRequest.postInfo = {
                postId: postId,
                userId: userId ? userId : 'anonymous user'
            };

            setLoading(true);
            jResponse = await requestServer('POST', JSON.stringify(jRequest));
            setLoading(false);

            if (jResponse.error_code === 0) {
                const updatedPosts = posts.filter((post) => post.post_id !== postId);
                setPosts(updatedPosts);
            } else {
                openModal(jResponse.error_message);
            }
        } catch (error) {
            setLoading(false);
            openModal(jResponse.error_message);
        }
    };

    // 5. 댓글 저장 */
    const handleAddComment = async (postId, commentText) => {
        try {
            var jRequest = {};
            var jResponse = null;

            const userId = userInfo.getLoginUserId();

            jRequest.commandName = "post.addPostComment";
            jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;

            jRequest.commentInfo = {
                postId: postId,
                content: commentText,
                userId: userId ? userId : 'anonymous user',
            };

            jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                const updatedPosts = posts.map((post) => {
                    if (post.post_id === postId) {
                        return {
                            ...post,
                            comments: [
                                ...post.comments,
                                jResponse.commentInfo,
                            ],
                        };
                    }
                    return post;
                });
                setPosts(updatedPosts);
            } else {
                openModal(jResponse.error_message);
            }
        } catch (error) {
            openModal(jResponse.error_message);
        }
    };

    // 6. 댓글 편집 후 저장
    const handleEditComment = async (postId, commentId, newContent) => {
        try {
            var jRequest = {};
            var jResponse = null;

            const userId = userInfo.getLoginUserId();
            if (!userId) {
                openModal('You do not have permission');
                return;
            }

            const post = posts.find(post => post.post_id === postId);

            jRequest.commandName = "post.editPostComment";
            jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;
            jRequest.commentInfo = {
                postId: postId,
                commentId: commentId,
                content: newContent,
                userId: userId ? userId : 'anonymous user',
            };

            jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                const updatedPosts = posts.map((post) => {
                    if (post.post_id === postId) {
                        const updatedComments = post.comments?.map((comment, index) =>
                            comment.comment_id === commentId ? { ...comment, comment_content: newContent } : comment
                        );
                        return { ...post, comments: updatedComments };
                    }
                    return post;
                });
                setPosts(updatedPosts);
            }
            else {
                openModal(jResponse.error_message);
            }
        } catch (error) {
            openModal(error);
        }
    };

    // 7. 댓글 삭제
    const handleDeleteComment = async (postId, commentId) => {
        try {
            var jRequest = {};
            var jResponse = null;

            const userId = userInfo.getLoginUserId();
            if (!userId) {
                openModal('You do not have permission');
                return;
            }

            jRequest.commandName = "post.deletePostComment";
            jRequest.systemCode = process.env.NEXT_PUBLIC_DEFAULT_SYSTEM_CODE;

            jRequest.commentInfo = {
                postId: postId,
                commentId: commentId,
                userId: userId ? userId : 'anonymous user',
            };

            jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                const updatedPosts = posts.map((post) => {
                    if (post.post_id === postId) {
                        const updatedComments = post.comments.filter((_, index) => index !== commentId);
                        return { ...post, comments: updatedComments };
                    }
                    return post;
                });
                setPosts(updatedPosts);
            }
            else {
                openModal(jResponse.error_message);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };



    return (
        <div className="w-full max-w-4xl mx-auto">
            {loading && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
            )}
            <BrunnerMessageBox
                isOpen={modalContent.isOpen}
                message={modalContent.message}
                onConfirm={modalContent.onConfirm}
                onClose={modalContent.onClose}
            />
            <div className="mb-6">
                <textarea
                    value={postText}
                    onChange={handlePostChange}
                    placeholder="Input new post content..."
                    maxLength="1000"
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button onClick={handleAddPost} className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md">
                    Post
                </button>
            </div>
            <div className="post-list">
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

export default Board;
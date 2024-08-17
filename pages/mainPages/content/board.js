import React, { useState, useEffect } from 'react';
import requestServer from '@/components/requestServer';
import * as userInfo from '@/components/userInfo';

// 게시글 컴포넌트
function Post({ post, onAddComment, onEditPost, onDeletePost, onEditComment, onDeleteComment }) {
    const [commentText, setCommentText] = useState('');
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editedPostText, setEditedPostText] = useState(post.content);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedCommentText, setEditedCommentText] = useState('');

    const handleCommentChange = (e) => {
        setCommentText(e.target.value);
    };

    const handleAddComment = () => {
        if (commentText.trim()) {
            onAddComment(post.id, commentText);
            setCommentText('');
        }
    };

    const handleEditPostChange = (e) => {
        setEditedPostText(e.target.value);
    };

    const handleEditPost = () => {
        onEditPost(post.id, editedPostText);
        setIsEditingPost(false);
    };

    const handleDeletePost = () => {
        onDeletePost(post.id);
    };

    const handleEditCommentChange = (e) => {
        setEditedCommentText(e.target.value);
    };

    const handleEditComment = (commentId) => {
        onEditComment(post.id, commentId, editedCommentText);
        setEditingCommentId(null);
    };

    const handleDeleteComment = (commentId) => {
        onDeleteComment(post.id, commentId);
    };

    return (
        <div className="border-b border-gray-300 py-4">
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
                    <strong>{post.authorId}</strong>
                    <span className="text-gray-500 text-sm ml-2">{new Date(post.timestamp).toLocaleString()}</span>
                    : {post.content}
                </p>
            )}
            <div className="flex mt-2">
                {!isEditingPost && (
                    <>
                        <button onClick={() => setIsEditingPost(true)} className="mr-2 px-4 py-2 bg-yellow-500 text-white rounded-md">
                            Edit
                        </button>
                        <button onClick={handleDeletePost} className="px-4 py-2 bg-red-500 text-white rounded-md">
                            Delete
                        </button>
                    </>
                )}
            </div>
            <div className="ml-5 mt-2">
                {post.comments.map((comment, index) => (
                    <div key={index} className="ml-4 mb-2">
                        {editingCommentId === index ? (
                            <div>
                                <input
                                    type="text"
                                    value={editedCommentText}
                                    onChange={handleEditCommentChange}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                />
                                <button onClick={() => handleEditComment(index)} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">
                                    Save
                                </button>
                                <button onClick={() => setEditingCommentId(null)} className="mt-2 ml-2 px-4 py-2 bg-gray-500 text-white rounded-md">
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <p>
                                <strong>{comment.authorId}</strong>
                                <span className="text-gray-500 text-sm ml-2">{new Date(comment.timestamp).toLocaleString()}</span>
                                : {comment.content}
                            </p>
                        )}
                        <div className="flex mt-1">
                            {editingCommentId !== index && (
                                <>
                                    <button onClick={() => { setEditingCommentId(index); setEditedCommentText(comment.content); }} className="mr-2 px-3 py-1 bg-yellow-500 text-white rounded-md">
                                        Edit
                                    </button>
                                    <button onClick={() => handleDeleteComment(index)} className="px-3 py-1 bg-red-500 text-white rounded-md">
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
                    placeholder="댓글을 입력하세요"
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

post.id : String (일련번호)
post.authorId : String
post.content : String
post.timestamp : Date
post.comments : JsonArray of JsonObject 

comment.id:  : String (일련번호)
comment.authorId
comment.content
comment.timestamp

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
    const tickerCode = boardInfo.tickerCode;


    useEffect(() => {
        fetchPosts();
    }, []);

    // 1. 게시글 목록 조회
    const fetchPosts = async () => {

        var jRequest = {};
        var jResponse = null;
    
        try {
            jRequest.commandName = "post.getPostList";
            jRequest.postInfo = {postType:`TICKER_INFO-${tickerCode}`}; // 게시판 유형을 TICKER_INFO-{종모코드}로 함
    
            setLoading(true); // 데이터 로딩 시작
            jResponse = await requestServer('POST', JSON.stringify(jRequest));
            setLoading(false); // 데이터 로딩 시작

            if (jResponse.error_code === 0) {
                const data = jResponse.postList;
                setPosts(data);
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
        if (postText.trim()) {
            const userId = userInfo.getLoginUserId();
            const postType = `TICKER_INFO-${tickerCode}`;
            
            const newPost = {
                id: Date.now(),
                postType: postType,
                content: postText,
                authorId: userId ? userId: 'anonymous user',
                timestamp: new Date().toISOString(),
                comments: []
            };

            var jRequest = {};
            var jResponse = null;
        
            try {
                jRequest.commandName = "post.addPost";
                jRequest.postInfo = newPost;        

                setLoading(true); 
                jResponse = await requestServer('POST', JSON.stringify(jRequest));
                setLoading(false);

                if (jResponse.error_code === 0) {
                    setPosts([newPost, ...posts]);
                    setPostText('');    
                } else {
                    openModal(jResponse.error_message);
                }
            } catch (error) {
                openModal(jResponse.error_message);
                setLoading(false); 
            }
        }
    };

    // 3. 게시글 편집 후 저장 */
    const handleEditPost = async (postId, newContent) => {
        try {
            const userId = userInfo.getLoginUserId();

            jRequest.commandName = "post.editPost";
            jRequest.postInfo = {
                postId:postId, 
                content:newContent,
                authorId: userId ? userId: 'anonymous user',
            };        

            jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                const updatedPosts = posts.map((post) =>
                    post.id === postId ? { ...post, content: newContent, authorId: userId ? userId: 'anonymous user' } : post
                );
                setPosts(updatedPosts);
            } else {
                openModal(jResponse.error_message);
            }
        } catch (error) {
            openModal(jResponse.error_message);
        }
    };

    // 4. 게시글 삭제 */
    const handleDeletePost = async (postId) => {
        try {
            const userId = userInfo.getLoginUserId();

            jRequest.commandName = "post.deletePost";
            jRequest.postInfo = {
                postId: postId, 
                authorId: userId ? userId: 'anonymous user'
            };        

            jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                const updatedPosts = posts.filter((post) => post.id !== postId);
                setPosts(updatedPosts);
            } else {
                openModal(jResponse.error_message);
            }
        } catch (error) {
            openModal(jResponse.error_message);
        }
    };

    // 5. 댓글 저장 */
    const handleAddComment = async (postId, commentText) => {
        try {
            const userId = userInfo.getLoginUserId();
            
            jRequest.commandName = "post.addPostComment";
            jRequest.postInfo = {
                authorId: userId ? userId: 'anonymous user',
                content: commentText,
                timestamp: new Date().toISOString(),
            };        

            jResponse = await requestServer('POST', JSON.stringify(jRequest));

            if (jResponse.error_code === 0) {
                const updatedPosts = posts.map((post) => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            comments: [
                                ...post.comments,
                                {
                                    authorId: 'UserID',
                                    content: commentText,
                                    timestamp: new Date().toISOString(),
                                },
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
    const handleEditComment = async (postId, commentIndex, newContent) => {
        try {
            // 서버에서 댓글 업데이트하는 로직
            const post = posts.find(post => post.id === postId);
            const commentId = post.comments[commentIndex].id;

            await fetch(`/api/posts/${postId}/comments/${commentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent }),
            });

            const updatedPosts = posts.map((post) => {
                if (post.id === postId) {
                    const updatedComments = post.comments.map((comment, index) =>
                        index === commentIndex ? { ...comment, content: newContent } : comment
                    );
                    return { ...post, comments: updatedComments };
                }
                return post;
            });
            setPosts(updatedPosts);
        } catch (error) {
            console.error('Error editing comment:', error);
        }
    };

    // 7. 댓글 삭제
    const handleDeleteComment = async (postId, commentIndex) => {
        try {
            // 서버에서 댓글 삭제하는 로직
            const post = posts.find(post => post.id === postId);
            const commentId = post.comments[commentIndex].id;

            await fetch(`/api/posts/${postId}/comments/${commentId}`, { method: 'DELETE' });

            const updatedPosts = posts.map((post) => {
                if (post.id === postId) {
                    const updatedComments = post.comments.filter((_, index) => index !== commentIndex);
                    return { ...post, comments: updatedComments };
                }
                return post;
            });
            setPosts(updatedPosts);
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
            <div className="mb-6">
                <textarea
                    value={postText}
                    onChange={handlePostChange}
                    placeholder="새 게시글 작성..."
                    maxLength="1000"
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
                <button onClick={handleAddPost} className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md">
                    Post
                </button>
            </div>
            <div className="post-list">
                {posts.map((post) => (
                    <Post
                        key={post.id}
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
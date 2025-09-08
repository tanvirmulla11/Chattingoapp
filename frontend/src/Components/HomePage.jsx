import React, { useEffect, useRef, useState } from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import Profile from "./Profile/Profile";
import CreateGroup from "./Group/CreateGroup";
import { useDispatch, useSelector } from "react-redux";
import { currentUser, logoutAction, searchUser } from "../../Redux/Auth/Action";
import { createChat, getUsersChat } from "../../Redux/Chat/Action";
import { createMessage, getAllMessages } from "../../Redux/Message/Action";
import SockJs from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import { BASE_API_URL } from "../../config/api";
import { AiOutlineSearch, AiOutlineArrowLeft } from "react-icons/ai";
import { BsEmojiSmile, BsMicFill, BsThreeDotsVertical } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";
import { TbCircleDashed } from "react-icons/tb";
import { BiCommentDetail } from "react-icons/bi";
import { Menu, MenuItem } from "@mui/material";

// --- Embedded Styles for Modern UI (No Tailwind Installation Needed) ---
const ModernStyles = () => (
  <style>{`
    .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif; }
    .h-screen { height: 100vh; }
    .w-full { width: 100%; }
    .flex { display: flex; }
    .flex-col { flex-direction: column; }
    .flex-1 { flex: 1 1 0%; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .justify-end { justify-content: flex-end; }
    .justify-start { justify-content: flex-start; }
    .gap-2 { gap: 0.5rem; }
    .space-x-1 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.25rem; }
    .space-x-2 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.5rem; }
    .space-x-4 > :not([hidden]) ~ :not([hidden]) { margin-left: 1rem; }
    .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
    .overflow-hidden { overflow: hidden; }
    .overflow-y-auto { overflow-y: auto; }
    .bg-gray-50 { background-color: #F9FAFB; }
    .bg-gray-100 { background-color: #F3F4F6; }
    .bg-white { background-color: #FFFFFF; }
    .bg-indigo-50 { background-color: #EEF2FF; }
    .bg-indigo-100 { background-color: #E0E7FF; }
    .bg-indigo-600 { background-color: #4F46E5; }
    .hover\\:bg-gray-100:hover { background-color: #F3F4F6; }
    .hover\\:bg-gray-200:hover { background-color: #E5E7EB; }
    .hover\\:bg-indigo-700:hover { background-color: #4338CA; }
    .border-r { border-right-width: 1px; }
    .border-b { border-bottom-width: 1px; }
    .border-t { border-top-width: 1px; }
    .border-l-4 { border-left-width: 4px; }
    .border-transparent { border-color: transparent; }
    .border-gray-200 { border-color: #E5E7EB; }
    .border-indigo-500 { border-color: #6366F1; }
    .p-4 { padding: 1rem; }
    .p-3 { padding: 0.75rem; }
    .p-2 { padding: 0.5rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .pl-10 { padding-left: 2.5rem; }
    .pl-3 { padding-left: 0.75rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-md { font-size: 1rem; line-height: 1.5rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .text-gray-400 { color: #9CA3AF; }
    .text-gray-500 { color: #6B7281; }
    .text-gray-600 { color: #4B5563; }
    .text-gray-700 { color: #374151; }
    .text-gray-800 { color: #1F2937; }
    .text-gray-900 { color: #111827; }
    .text-white { color: #FFFFFF; }
    .text-indigo-200 { color: #C7D2FE; }
    .text-indigo-500 { color: #6366F1; }
    .text-indigo-600 { color: #4F46E5; }
    .hover\\:text-gray-700:hover { color: #374151; }
    .hover\\:text-gray-800:hover { color: #1F2937; }
    .hover\\:text-indigo-600:hover { color: #4F46E5; }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .rounded-full { border-radius: 9999px; }
    .rounded-2xl { border-radius: 1rem; }
    .rounded-br-none { border-bottom-right-radius: 0; }
    .rounded-bl-none { border-bottom-left-radius: 0; }
    .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
    .object-cover { object-fit: cover; }
    .w-6 { width: 1.5rem; }
    .h-6 { height: 1.5rem; }
    .w-8 { width: 2rem; }
    .h-8 { height: 2rem; }
    .w-10 { width: 2.5rem; }
    .h-10 { height: 2.5rem; }
    .w-12 { width: 3rem; }
    .h-12 { height: 3rem; }
    .w-24 { width: 6rem; }
    .h-24 { height: 6rem; }
    .cursor-pointer { cursor: pointer; }
    .relative { position: relative; }
    .absolute { position: absolute; }
    .inset-y-0 { top: 0; bottom: 0; }
    .left-0 { left: 0; }
    .shrink-0 { flex-shrink: 0; }
    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .max-w-xs { max-width: 20rem; }
    .max-w-md { max-width: 28rem; }
    .max-w-lg { max-width: 32rem; }
    .max-w-sm { max-width: 24rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mr-2 { margin-right: 0.5rem; }
    .ml-3 { margin-left: 0.75rem; }
    .ml-4 { margin-left: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .outline-none { outline: 2px solid transparent; outline-offset: 2px; }
    .focus\\:outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }
    .focus\\:ring-2:focus { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
    .focus\\:ring-indigo-500:focus { --tw-ring-color: #6366F1; }
    .transition-transform { transition-property: transform; }
    .duration-300 { transition-duration: 300ms; }
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    @media (min-width: 768px) {
      .md\\:flex { display: flex; }
      .md\\:w-\\[350px\\] { width: 350px; }
      .md\\:hidden { display: none; }
    }
    @media (min-width: 1024px) {
      .lg\\:w-\\[400px\\] { width: 400px; }
    }
    .hidden { display: none; }
  `}</style>
);


function HomePage() {
    // --- All your original state and logic ---
    const [querys, setQuerys] = useState("");
    const [currentChat, setCurrentChat] = useState(null);
    const [content, setContent] = useState("");
    const [isProfile, setIsProfile] = useState(false);
    const navigate = useNavigate();
    const [isGroup, setIsGroup] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const dispatch = useDispatch();
    const { auth, chat, message } = useSelector((store) => store);
    const token = localStorage.getItem("token");
    const [stompClient, setStompClient] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const messageContainerRef = useRef(null);

    useEffect(() => {
        if (messageContainerRef.current) {
            messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
    }, [message.messages]);

    const connect = () => {
        if (!token) return;
        const client = new Client({
            webSocketFactory: () => new SockJs(`${BASE_API_URL}/ws`),
            connectHeaders: {
                Authorization: `Bearer ${token}`,
                "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
            },
            onConnect: onConnect,
            onStompError: (error) => console.log("on error ", error),
            debug: (str) => console.log("STOMP: " + str),
        });

        setStompClient(client);
        client.activate();
    };

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(";").shift();
    }

    const onConnect = () => {
        setIsConnected(true);
    };

    const onMessageReceive = (payload) => {
        const receivedMessage = JSON.parse(payload.body);
        dispatch({ type: "ADD_NEW_MESSAGE", payload: receivedMessage }); 
    };
    
    useEffect(() => {
        if (token) {
            connect();
            dispatch(currentUser(token));
        }
        return () => {
            stompClient?.deactivate();
        };
    }, [token, dispatch, stompClient]);
    
    useEffect(() => {
        if (isConnected && stompClient && currentChat?.id) {
            const subscription = stompClient.subscribe(
              currentChat.group ? `/group/${currentChat.id}` : `/user/${currentChat.id}`, 
              onMessageReceive
            );
            return () => subscription.unsubscribe();
        }
    }, [isConnected, stompClient, currentChat, dispatch]);

    useEffect(() => {
        if (currentChat?.id) {
            dispatch(getAllMessages({ chatId: currentChat.id, token }));
        }
    }, [currentChat, token, dispatch]);

    useEffect(() => {
        if(token) dispatch(getUsersChat({ token }));
    }, [chat.createdChat, chat.createdGroup, token, dispatch]);

    const handleClick = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);
    
    const handleClickOnChatCard = (userId) => {
        dispatch(createChat({ token, data: { userId } }));
        setQuerys("");
    }

    const handleSearch = (keyword) => dispatch(searchUser({ keyword, token }));

    const sendMessage = () => {
        if (!content.trim() || !currentChat) return;
        dispatch(createMessage({
            token,
            data: { chatId: currentChat.id, content: content },
        }));
        setContent("");
    };
    
    const handleCurrentChat = (item) => setCurrentChat(item);

    const handleNavigate = () => setIsProfile(true);
    const handleCloseOpenProfile = () => setIsProfile(false);
    const handleCreateGroup = () => setIsGroup(true);

    const handleLogout = () => {
        dispatch(logoutAction());
        navigate("/signin");
    };

    useEffect(() => {
        if (auth.reqUser === null && token) {
             dispatch(currentUser(token));
        }
        if(auth.reqUser === null && !token){
            navigate("/signin");
        }
    }, [auth.reqUser, token, navigate, dispatch]);

    const searchedUsers = auth.searchUser?.filter(u => u.id !== auth.reqUser?.id);

    const getChatPartner = (chat) => {
      if (!chat || chat.group || !chat.users || !auth.reqUser) return null;
      return chat.users.find(u => u.id !== auth.reqUser.id);
    }
    
    return (
      <>
        <ModernStyles />
        <div className="h-screen w-full flex overflow-hidden bg-gray-100 font-sans">
            <div className={`w-full md:w-[350px] lg:w-[400px] h-screen bg-gray-50 border-r border-gray-200 flex flex-col transition-transform duration-300 ${currentChat && 'hidden md:flex'}`}>
                {isProfile ? (
                    <Profile handleCloseOpenProfile={handleCloseOpenProfile} />
                ) : isGroup ? (
                    <CreateGroup setIsGroup={setIsGroup} />
                ) : (
                    <>
                        <header className="p-4 border-b border-gray-200 flex justify-between items-center shrink-0">
                            <div onClick={handleNavigate} className="flex items-center cursor-pointer">
                                <img className="h-10 w-10 rounded-full object-cover" src={auth.reqUser?.profile || 'https://placehold.co/100x100/e2e8f0/e2e8f0?text=?'} alt="Your Avatar" />
                                <h1 className="ml-3 text-xl font-bold text-gray-800">{auth.reqUser?.name}</h1>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button onClick={() => navigate('/status')} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200">
                                   <TbCircleDashed className="w-6 h-6"/>
                                </button>
                                 <button onClick={handleCreateGroup} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200">
                                   <BiCommentDetail className="w-6 h-6"/>
                                </button>
                                <button onClick={handleClick} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200">
                                    <BsThreeDotsVertical className="w-6 h-6" />
                                </button>
                                <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                                    <MenuItem onClick={handleNavigate}>Profile</MenuItem>
                                    <MenuItem onClick={handleCreateGroup}>New Group</MenuItem>
                                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                                </Menu>
                            </div>
                        </header>
                        
                        <div className="p-4 shrink-0">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                   <AiOutlineSearch className="w-5 h-5"/>
                                </span>
                                <input 
                                  type="text" 
                                  className="w-full pl-10 pr-4 py-2 border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                  placeholder="Search or start new chat"
                                  onChange={(e) => {
                                      setQuerys(e.target.value);
                                      handleSearch(e.target.value);
                                  }}
                                  value={querys}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {querys && searchedUsers ? (
                              searchedUsers.map((item) => (
                                <div key={item.id} onClick={() => handleClickOnChatCard(item.id)}>
                                    <ChatCard 
                                        chatData={{ users: [item, auth.reqUser] }}
                                        active={currentChat?.users?.some(u => u.id === item.id)}
                                        onClick={() => {}}
                                        authUser={auth.reqUser}
                                    />
                                </div>
                              ))
                            ) : (
                              chat.chats?.map((item) => (
                                <ChatCard 
                                  key={item.id} 
                                  chatData={item}
                                  active={currentChat?.id === item.id} 
                                  onClick={handleCurrentChat}
                                  authUser={auth.reqUser}
                                />
                              ))
                            )}
                        </div>
                    </>
                )}
            </div>

            <main className={`flex-1 h-screen flex flex-col ${!currentChat && 'hidden md:flex'}`}>
                {currentChat ? (
                    <>
                        <header className="bg-white p-4 border-b border-gray-200 flex items-center justify-between shadow-sm shrink-0">
                            <div className="flex items-center">
                                <button onClick={() => setCurrentChat(null)} className="md:hidden mr-2 text-gray-600 hover:text-gray-800">
                                    <AiOutlineArrowLeft className="w-6 h-6" />
                                </button>
                                <img className="h-10 w-10 rounded-full object-cover" src={
                                    (currentChat.group ? currentChat.chatImage : getChatPartner(currentChat)?.profile) || 'https://placehold.co/100x100/e2e8f0/e2e8f0?text=?'
                                } alt="Chat Avatar" />
                                <div className="ml-4">
                                    <h2 className="text-lg font-semibold text-gray-800">{
                                        currentChat.group ? currentChat.chatName : getChatPartner(currentChat)?.name
                                    }</h2>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200">
                                    <AiOutlineSearch className="w-6 h-6" />
                                </button>
                                <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200">
                                    <BsThreeDotsVertical className="w-6 h-6" />
                                </button>
                            </div>
                        </header>

                        <div className="flex-1 p-6 overflow-y-auto bg-gray-100">
                           <div className="space-y-4">
                               {message.messages?.map((item, i) => (
                                   <MessageCard key={i} message={item} isReqUserMessage={item.user?.id === auth.reqUser?.id} />
                               ))}
                               <div ref={messageContainerRef} />
                           </div>
                        </div>

                        <footer className="bg-white p-4 border-t border-gray-200 shrink-0">
                            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center space-x-4">
                                <button type="button" className="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100">
                                    <BsEmojiSmile className="w-6 h-6" />
                                </button>
                                <button type="button" className="text-gray-500 hover:text-indigo-600 p-2 rounded-full hover:bg-gray-100">
                                    <ImAttachment className="w-6 h-6"/>
                                </button>
                                <input 
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                      }
                                    }}
                                    type="text" 
                                    placeholder="Type a message..." 
                                    className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                />
                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-3 rounded-full transition duration-300">
                                    <BsMicFill className="w-6 h-6"/>
                                </button>
                            </form>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center bg-gray-100 p-4">
                        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                            <BiCommentDetail className="w-12 h-12 text-indigo-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Chattingo Web</h2>
                        <p className="text-gray-500 mt-2 max-w-sm">Select a chat to start messaging. Your conversations are secure and private.</p>
                    </div>
                )}
            </main>
        </div>
      </>
  );
}

export default HomePage;


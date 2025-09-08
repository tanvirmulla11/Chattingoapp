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
import { BASE_API_URL } from "../config/api";
import { AiOutlineSearch, AiOutlineArrowLeft } from "react-icons/ai";
import { BsCheck2All, BsEmojiSmile, BsMicFill, BsThreeDotsVertical } from "react-icons/bs";
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
    .items-end { align-items: flex-end; }
    .space-x-1 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.25rem; }
    .space-x-2 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.5rem; }
    .space-x-3 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.75rem; }
    .space-x-4 > :not([hidden]) ~ :not([hidden]) { margin-left: 1rem; }
    .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
    .space-y-4 > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }
    .overflow-hidden { overflow: hidden; }
    .overflow-y-auto { overflow-y: auto; }
    .bg-gray-50 { background-color: #F9FAFB; }
    .bg-gray-100 { background-color: #F3F4F6; }
    .bg-gray-200 { background-color: #E5E7EB; }
    .bg-white { background-color: #FFFFFF; }
    .bg-green-600 { background-color: #059669; }
    .bg-green-50 { background-color: #F0FDF4; }
    .hover\\:bg-gray-100:hover { background-color: #F3F4F6; }
    .border { border-width: 1px; }
    .border-r { border-right-width: 1px; }
    .border-b { border-bottom-width: 1px; }
    .border-transparent { border-color: transparent; }
    .border-gray-200 { border-color: #E5E7EB; }
    .border-green-500 { border-color: #10B981; }
    .p-4 { padding: 1rem; }
    .p-3 { padding: 0.75rem; }
    .p-2 { padding: 0.5rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .pl-10 { padding-left: 2.5rem; }
    .pr-4 { padding-right: 1rem; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .text-gray-400 { color: #9CA3AF; }
    .text-gray-500 { color: #6B7281; }
    .text-gray-600 { color: #4B5563; }
    .text-gray-800 { color: #1F2937; }
    .text-gray-900 { color: #111827; }
    .text-white { color: #FFFFFF; }
    .text-blue-500 { color: #3B82F6; }
    .rounded-full { border-radius: 9999px; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-md { border-radius: 0.375rem; }
    .shadow-sm { box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
    .shadow-md { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
    .object-cover { object-fit: cover; }
    .w-6 { width: 1.5rem; }
    .h-6 { height: 1.5rem; }
    .w-10 { width: 2.5rem; }
    .h-10 { height: 2.5rem; }
    .w-12 { width: 3rem; }
    .h-12 { height: 3rem; }
    .cursor-pointer { cursor: pointer; }
    .relative { position: relative; }
    .absolute { position: absolute; }
    .inset-y-0 { top: 0; bottom: 0; }
    .left-0 { left: 0; }
    .shrink-0 { flex-shrink: 0; }
    .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .max-w-md { max-width: 28rem; }
    .mt-1 { margin-top: 0.25rem; }
    .ml-2 { margin-left: 0.5rem; }
    .ml-3 { margin-left: 0.75rem; }
    .ml-auto { margin-left: auto; }
    .outline-none { outline: 2px solid transparent; outline-offset: 2px; }
    .focus\\:outline-none:focus { outline: 2px solid transparent; outline-offset: 2px; }
    .focus\\:ring-2:focus { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
    .focus\\:ring-green-500:focus { --tw-ring-color: #10B981; }
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    .whatsapp-bg { background-color: #E5DDD5; background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); }
    .message-sent { background-color: #DCF8C6; }
    .message-received { background-color: #FFFFFF; }
    @media (min-width: 768px) {
      .md\\:flex { display: flex; }
      .md\\:w-\\[350px\\] { width: 350px; }
      .md\\:block { display: block; }
      .hidden { display: none; }
    }
     @media (max-width: 767px) {
      .mobile-hidden { display: none; }
      .mobile-flex { display: flex; }
    }
  `}</style>
));

const ChatCard = ({ chatData, active, onClick, authUser }) => {
    const getDisplayName = () => {
        if (chatData.group) return chatData.chatName;
        const partner = chatData.users.find(u => u.id !== authUser?.id);
        return partner?.name || "Chat";
    };

    const getDisplayImage = () => {
        if (chatData.group) return chatData.chatImage;
        const partner = chatData.users.find(u => u.id !== authUser?.id);
        return partner?.profile;
    };

    return (
        <div onClick={() => onClick(chatData)} className={`flex items-center p-3 cursor-pointer transition-colors ${active ? 'bg-gray-200' : 'hover:bg-gray-100'}`}>
            <img className="h-12 w-12 rounded-full object-cover" src={getDisplayImage() || 'https://placehold.co/100x100/e2e8f0/e2e8f0?text=?'} alt="Avatar" />
            <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold text-gray-800">{getDisplayName()}</p>
                    <p className="text-xs text-gray-500">10:20 AM</p>
                </div>
                <div className="flex items-center">
                    <p className="text-sm text-gray-600 truncate">Last message here...</p>
                </div>
            </div>
        </div>
    );
};

const MessageCard = ({ message, isReqUserMessage }) => {
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    
    return (
      <div className={`flex ${isReqUserMessage ? 'justify-end' : 'justify-start'}`}>
        <div className={`rounded-lg px-3 py-2 max-w-md ${isReqUserMessage ? 'message-sent' : 'message-received shadow-sm'}`}>
          <p className="text-md text-gray-800">{message.content}</p>
          <div className="flex items-center justify-end mt-1">
            <p className="text-xs text-gray-500 mr-2">{formatTime(message.timestamp)}</p>
            {isReqUserMessage && <BsCheck2All className="text-blue-500" />}
          </div>
        </div>
      </div>
    );
};


function HomePage() {
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

    useEffect(() => {
        if (!token) {
            navigate("/signin");
            return;
        }

        const client = new Client({
            webSocketFactory: () => new SockJs(`${BASE_API_URL}/ws`),
            connectHeaders: { Authorization: `Bearer ${token}` },
            onConnect: () => setIsConnected(true),
            onStompError: (err) => console.log('STOMP Error', err),
        });

        client.activate();
        setStompClient(client);

        dispatch(currentUser(token));
        dispatch(getUsersChat({ token }));

        return () => {
            client.deactivate();
        };
    }, [token, navigate, dispatch]);

    useEffect(() => {
        if (!isConnected || !stompClient || !currentChat?.id) return;
        
        const destination = currentChat.group ? `/group/${currentChat.id}` : `/user/${currentChat.id}`;
        
        const subscription = stompClient.subscribe(destination, (payload) => {
            const receivedMessage = JSON.parse(payload.body);
            // This is a simple way to update messages. For a real app, you might want a more sophisticated Redux action.
             if (receivedMessage.chat.id === currentChat.id) {
                dispatch(getAllMessages({ chatId: currentChat.id, token }));
            }
        });

        return () => subscription.unsubscribe();

    }, [isConnected, stompClient, currentChat, dispatch, token]);

    useEffect(() => {
        if (currentChat?.id) {
            dispatch(getAllMessages({ chatId: currentChat.id, token }));
        }
    }, [currentChat, dispatch, token]);

    const handleSearch = (keyword) => {
        dispatch(searchUser({ keyword, token }));
    };

    const handleClickOnChatCard = (userId) => {
        dispatch(createChat({ token, data: { userId } })).then((action) => {
            if(action.payload) handleCurrentChat(action.payload);
        });
        setQuerys("");
    };

    const sendMessage = () => {
        if (!content.trim() || !currentChat) return;
        dispatch(createMessage({
            token,
            data: { chatId: currentChat.id, content },
        }));
        setContent("");
    };
    
    const handleCurrentChat = (item) => setCurrentChat(item);
    const handleCloseOpenProfile = () => setIsProfile(false);
    const handleCreateGroup = () => setIsGroup(true);
    const handleLogout = () => {
        dispatch(logoutAction());
        navigate("/signin");
    };

    const searchedUsers = auth.searchUser?.filter(u => u.id !== auth.reqUser?.id);
    const getChatPartner = (chat) => chat?.users.find(u => u.id !== auth.reqUser?.id);

    return (
      <>
        <ModernStyles />
        <div className={`h-screen w-full flex overflow-hidden bg-gray-100 font-sans ${currentChat ? 'mobile-hidden' : 'mobile-flex'} md:flex`}>
            <div className="w-full md:w-[350px] lg:w-[400px] h-screen bg-white border-r border-gray-200 flex flex-col">
                {isProfile ? <Profile handleCloseOpenProfile={handleCloseOpenProfile} /> : isGroup ? <CreateGroup setIsGroup={setIsGroup} /> : (
                    <>
                        <header className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
                            <div onClick={() => setIsProfile(true)} className="flex items-center cursor-pointer">
                                <img className="h-10 w-10 rounded-full object-cover" src={auth.reqUser?.profile || 'https://placehold.co/100x100/e2e8f0/e2e8f0?text=?'} alt="Your Avatar" />
                            </div>
                            <div className="flex items-center space-x-1">
                                <button onClick={() => navigate('/status')} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-200">
                                   <TbCircleDashed className="w-6 h-6"/>
                                </button>
                                <button onClick={handleCreateGroup} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-200">
                                   <BiCommentDetail className="w-6 h-6"/>
                                </button>
                                <button onClick={(e) => setAnchorEl(e.currentTarget)} className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-200">
                                    <BsThreeDotsVertical className="w-6 h-6" />
                                </button>
                                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                                    <MenuItem onClick={() => { setIsProfile(true); setAnchorEl(null); }}>Profile</MenuItem>
                                    <MenuItem onClick={() => { handleCreateGroup(); setAnchorEl(null); }}>New Group</MenuItem>
                                    <MenuItem onClick={() => { handleLogout(); setAnchorEl(null); }}>Logout</MenuItem>
                                </Menu>
                            </div>
                        </header>
                        
                        <div className="p-3 bg-gray-50 border-b border-gray-200">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                   <AiOutlineSearch className="w-5 h-5"/>
                                </span>
                                <input 
                                  type="text" 
                                  className="w-full pl-10 pr-4 py-2 border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-green-500" 
                                  placeholder="Search or start new chat"
                                  onChange={(e) => { setQuerys(e.target.value); handleSearch(e.target.value); }}
                                  value={querys}
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {querys ? (
                              searchedUsers?.map((item) => (
                                <div key={item.id} onClick={() => handleClickOnChatCard(item.id)}>
                                    <ChatCard chatData={{ users: [item, auth.reqUser] }} active={false} onClick={() => {}} authUser={auth.reqUser} />
                                </div>
                              ))
                            ) : (
                              chat.chats?.map((item) => (
                                <ChatCard key={item.id} chatData={item} active={currentChat?.id === item.id} onClick={handleCurrentChat} authUser={auth.reqUser} />
                              ))
                            )}
                        </div>
                    </>
                )}
            </div>

            <main className={`flex-1 h-screen flex-col ${!currentChat ? 'hidden' : 'flex'} md:flex`}>
                {currentChat ? (
                    <>
                        <header className="bg-gray-50 p-3 border-b border-gray-200 flex items-center justify-between shrink-0">
                            <div className="flex items-center">
                                <button onClick={() => setCurrentChat(null)} className="md:hidden mr-2 text-gray-600 hover:text-gray-800">
                                    <AiOutlineArrowLeft className="w-6 h-6" />
                                </button>
                                <img className="h-10 w-10 rounded-full object-cover" src={(currentChat.group ? currentChat.chatImage : getChatPartner(currentChat)?.profile) || 'https://placehold.co/100x100/e2e8f0/e2e8f0?text=?'} alt="Chat Avatar" />
                                <div className="ml-3">
                                    <h2 className="text-lg font-semibold text-gray-800">{currentChat.group ? currentChat.chatName : getChatPartner(currentChat)?.name}</h2>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-200"> <AiOutlineSearch className="w-6 h-6" /> </button>
                                <button className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-200"> <BsThreeDotsVertical className="w-6 h-6" /> </button>
                            </div>
                        </header>

                        <div className="flex-1 p-4 overflow-y-auto whatsapp-bg">
                           <div className="space-y-2">
                               {message.messages?.map((item, i) => (
                                   <MessageCard key={i} message={item} isReqUserMessage={item.user?.id === auth.reqUser?.id} />
                               ))}
                               <div ref={messageContainerRef} />
                           </div>
                        </div>

                        <footer className="bg-gray-50 p-3 border-t border-gray-200 shrink-0">
                            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex items-center space-x-3">
                                <button type="button" className="text-gray-500 hover:text-green-600 p-2 rounded-full"> <BsEmojiSmile className="w-6 h-6" /> </button>
                                <button type="button" className="text-gray-500 hover:text-green-600 p-2 rounded-full"> <ImAttachment className="w-6 h-6"/> </button>
                                <input 
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    type="text" 
                                    placeholder="Type a message" 
                                    className="flex-1 px-4 py-2 bg-white rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500" 
                                />
                                <button type="submit" className="text-gray-500 hover:text-green-600 p-2 rounded-full"> <BsMicFill className="w-6 h-6"/> </button>
                            </form>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center bg-gray-100 p-4 whatsapp-bg">
                        <div className="text-center">
                            <img src="https://i.ibb.co/L0x0W02/whatsapp-logo-removebg-preview.png" alt="WhatsApp" className="w-24 h-24 mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-800">Chattingo Web</h2>
                            <p className="text-gray-600 mt-2 max-w-sm">Send and receive messages without keeping your phone online. Use Chattingo on up to 4 linked devices and 1 phone at the same time.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
      </>
  );
}

export default HomePage;


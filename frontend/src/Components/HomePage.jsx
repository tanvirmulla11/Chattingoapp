import React, { useEffect, useRef, useState } from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import Profile from "./Profile/Profile";
import CreateGroup from "./Group/CreateGroup";
import { useDispatch, useSelector } from "react-redux";
import { currentUser, logoutAction, searchUser } from "../Redux/Auth/Action";
import { createChat, getUsersChat } from "../Redux/Chat/Action";
import { createMessage, getAllMessages } from "../Redux/Message/Action";
import SockJs from "sockjs-client/dist/sockjs";
import { Client } from "@stomp/stompjs";
import { BASE_API_URL } from "../config/api";
import ProfileSection from "./HomeComponents/ProfileSection";
import SearchBar from "./HomeComponents/SearchBar";
import ChatList from "./HomeComponents/ChatList";
import MessageCard from "./MessageCard/MessageCard";
import { AiOutlineSearch } from "react-icons/ai";
import { BsEmojiSmile, BsMicFill, BsThreeDotsVertical } from "react-icons/bs";
import { ImAttachment } from "react-icons/im";

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
  const [messages, setMessages] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const messageContainerRef = useRef(null);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const connect = () => {
    if (!token) return;
    const client = new Client({
      webSocketFactory: () => new SockJs(`${BASE_API_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        "X-XSRF-TOKEN": getCookie("XSRF-TOKEN"),
      },
      onConnect: onConnect,
      onStompError: onError,
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

  const onError = (error) => console.log("on error ", error);

  const onConnect = () => {
    setIsConnected(true);
    if (stompClient && currentChat) {
      if (currentChat.group) {
        stompClient.subscribe(`/group/${currentChat?.id}`, onMessageReceive);
      } else {
        stompClient.subscribe(`/user/${currentChat?.id}`, onMessageReceive);
      }
    }
  };

  const onMessageReceive = (payload) => {
    const receivedMessage = JSON.parse(payload.body);
    setMessages((prevMessages) => [...prevMessages, receivedMessage]);
  };

  useEffect(() => {
    connect();
    return () => {
      try {
        if (stompClient && isConnected) {
          stompClient.deactivate();
          setIsConnected(false);
        }
      } catch (e) {}
    };
  }, []);

  useEffect(() => {
    if (isConnected && stompClient && currentChat?.id) {
      const subscription = currentChat.group
        ? stompClient.subscribe(`/group/${currentChat.id}`, onMessageReceive)
        : stompClient.subscribe(`/user/${currentChat.id}`, onMessageReceive);

      return () => subscription.unsubscribe();
    }
  }, [isConnected, stompClient, currentChat]);

  useEffect(() => {
    if (message.newMessage && isConnected && stompClient && currentChat?.id) {
      stompClient.send(
        "/app/message",
        {},
        JSON.stringify(message.newMessage)
      );
      setMessages((prevMessages) => [...prevMessages, message.newMessage]);
    }
  }, [message.newMessage, isConnected, stompClient, currentChat]);

  useEffect(() => {
    if (message.messages) {
      setMessages(message.messages);
    }
  }, [message.messages]);

  useEffect(() => {
    if (currentChat?.id) {
      dispatch(getAllMessages({ chatId: currentChat.id, token }));
    }
  }, [currentChat, message.newMessage]);

  useEffect(() => {
    dispatch(getUsersChat({ token }));
  }, [chat.createdChat, chat.createdGroup]);

  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleClickOnChatCard = (userId) =>
    dispatch(createChat({ token, data: { userId } }));
  const handleSearch = (keyword) => dispatch(searchUser({ keyword, token }));

  const handleCreateNewMessage = () => {
    dispatch(
      createMessage({
        token,
        data: { chatId: currentChat.id, content: content },
      })
    );
    setContent("");
  };

  useEffect(() => {
    dispatch(currentUser(token));
  }, [token]);

  const handleCurrentChat = (item) => setCurrentChat(item);

  useEffect(() => {
    chat?.chats &&
      Array.isArray(chat.chats) &&
      chat.chats.forEach((item) => {
        dispatch(getAllMessages({ chatId: item.id, token }));
      });
  }, [chat?.chats, token, dispatch]);

  useEffect(() => {
    const prevLastMessages = { ...lastMessages };
    if (message.messages && message.messages.length > 0) {
      message.messages.forEach((msg) => {
        prevLastMessages[msg.chat.id] = msg;
      });
      setLastMessages(prevLastMessages);
    }
  }, [message.messages]);

  const handleNavigate = () => setIsProfile(true);
  const handleCloseOpenProfile = () => setIsProfile(false);
  const handleCreateGroup = () => setIsGroup(true);

  const handleLogout = () => {
    try {
      if (stompClient && isConnected) {
        stompClient.deactivate();
        setIsConnected(false);
      }
    } catch (e) {}
    dispatch(logoutAction());
    navigate("/signin");
  };

  useEffect(() => {
    if (!auth.reqUser) {
      navigate("/signin");
    }
  }, [auth.reqUser]);

  return (
    <div className="relative">
      <div className="w-[100vw] py-14 bg-[#00a884]">
        <div className="flex bg-[#f0f2f5] h-[90vh] absolute top-[5vh] left-[2vw] w-[96vw] rounded-lg shadow-lg overflow-hidden">
          {/* Sidebar */}
          <div className="left w-[30%] h-full bg-white/70 backdrop-blur-lg shadow-md">
            {isProfile && (
              <div className="w-full h-full">
                <Profile handleCloseOpenProfile={handleCloseOpenProfile} />
              </div>
            )}
            {isGroup && <CreateGroup setIsGroup={setIsGroup} />}
            {!isProfile && !isGroup && (
              <div className="w-full">
                <ProfileSection
                  auth={auth}
                  isProfile={isProfile}
                  isGroup={isGroup}
                  handleNavigate={handleNavigate}
                  handleClick={handleClick}
                  handleCreateGroup={handleCreateGroup}
                  handleLogout={handleLogout}
                  handleClose={handleClose}
                  open={open}
                  anchorEl={anchorEl}
                />
                <SearchBar
                  querys={querys}
                  setQuerys={setQuerys}
                  handleSearch={handleSearch}
                />
                <ChatList
                  querys={querys}
                  auth={auth}
                  chat={chat}
                  lastMessages={lastMessages}
                  handleClickOnChatCard={handleClickOnChatCard}
                  handleCurrentChat={handleCurrentChat}
                />
              </div>
            )}
          </div>

          {/* Default Page */}
          {!currentChat?.id && (
            <div className="w-[70%] flex flex-col items-center justify-center h-full bg-[#ece5dd]">
              <div className="max-w-[70%] text-center">
                <img
                  className="ml-11 lg:w-[75%]"
                  src="https://cdn.pixabay.com/photo/2015/08/03/13/58/whatsapp-873316_640.png"
                  alt="chattingo-icon"
                />
                <h1 className="text-4xl text-gray-600">Chattingo Web</h1>
                <p className="my-9">
                  Send and receive messages with Chattingo and save time.
                </p>
              </div>
            </div>
          )}

          {/* Chat Window */}
          {currentChat?.id && (
            <div
              className="w-[70%] relative"
              style={{
                backgroundImage:
                  "url('https://www.transparenttextures.com/patterns/cubes.png')",
                backgroundColor: "#ece5dd",
                backgroundRepeat: "repeat",
              }}
            >
              {/* Header */}
              <div className="header absolute top-0 w-full bg-[#f0f2f5] shadow-md z-10">
                <div className="flex justify-between">
                  <div className="py-3 space-x-4 flex items-center px-3">
                    <img
                      className="w-10 h-10 rounded-full"
                      src={
                        currentChat.group
                          ? currentChat.chat_image ||
                            "https://media.istockphoto.com/id/521977679/photo/silhouette-of-adult-woman.webp"
                          : auth.reqUser?.id !== currentChat.users[0]?.id
                          ? currentChat.users[0]?.profile ||
                            "https://media.istockphoto.com/id/521977679/photo/silhouette-of-adult-woman.webp"
                          : currentChat.users[1]?.profile ||
                            "https://media.istockphoto.com/id/521977679/photo/silhouette-of-adult-woman.webp"
                      }
                      alt="profile"
                    />
                    <p className="font-semibold text-gray-700">
                      {currentChat.group
                        ? currentChat.chatName
                        : auth.reqUser?.id !== currentChat.users[0]?.id
                        ? currentChat.users[0].name
                        : currentChat.users[1].name}
                    </p>
                  </div>
                  <div className="flex py-3 space-x-4 items-center px-3 text-gray-600">
                    <AiOutlineSearch />
                    <BsThreeDotsVertical />
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                className="px-10 h-[85vh] overflow-y-scroll pb-10 pt-20"
                ref={messageContainerRef}
              >
                <div className="space-y-2 w-full flex flex-col py-2">
                  {messages?.length > 0 &&
                    messages?.map((item, i) => (
                      <MessageCard
                        key={i}
                        isReqUserMessage={item?.user?.id === auth?.reqUser?.id}
                        content={item.content}
                        timestamp={item.timestamp}
                        profilePic={
                          item?.user?.profile ||
                          "https://media.istockphoto.com/id/521977679/photo/silhouette-of-adult-woman.webp"
                        }
                      />
                    ))}
                </div>
              </div>

              {/* Footer */}
              <div className="footer bg-[#f0f2f5] absolute bottom-0 w-full py-3 text-2xl shadow-md">
                <div className="flex justify-between items-center px-5 relative">
                  <BsEmojiSmile className="cursor-pointer" />
                  <ImAttachment />
                  <input
                    className="py-2 outline-none border-none bg-white pl-4 rounded-md w-[85%]"
                    type="text"
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type a message"
                    value={content}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleCreateNewMessage();
                        setContent("");
                      }
                    }}
                  />
                  <BsMicFill />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;

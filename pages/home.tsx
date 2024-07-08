import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import styles from "../styles/home.module.css";
import { Divider, Menu, Button, Input, Space, List, Avatar, Layout, Switch, Flex } from "antd";
import { CommentOutlined, LogoutOutlined, UserOutlined, AndroidOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import ChatbotLogo from "@/public/ChatbotLogo.png";
import { conversation } from "@/util/chatbot-util";
import { v4 as uuidv4 } from "uuid";
import { useMediaQuery } from "react-responsive";
import { ChatMessageType, QuestionResType } from "@/components/variables-types";
import { isAuthorized } from "@/util/user-util";

export default function HomeDisplay() {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { Content } = Layout;
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessageType[]>([]);
  const [displayError, setError] = useState<string | null>(null);
  const [loadings, setLoadings] = useState<boolean>(false);
  const [selected, setSelected] = useState<boolean>(false);

  useEffect(() => {
    const checkAuthorization = () => {
      if (!isAuthorized()) {
        router.push("/login");
      }
    };
    checkAuthorization();
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    // Check every one hour. If timeout, it will log out automatically.
    const interval = setInterval(checkAuthorization, 3000);
    return () => clearInterval(interval);
  }, [chat, router]);

  const handleSendMessage = (message: string) => {
    const id = uuidv4();
    const messageObject = { id, user: message, robot: "", documentation: [] };
    setChat((prevChat) => [...prevChat, messageObject]);
    setMessage("");
    setLoadings(true);
    let chatHistory: Array<QuestionResType> = [];
    if (selected) {
      chatHistory = chat
        .filter((item) => item.robot !== "")
        .map((item) => ({
          Question: item.user,
          Response: item.robot,
        }))
        .slice(-5);
    }
    conversation(message, chatHistory)
      .then((result) => {
        console.log("I got the result.");
        setChat((prevChat) => {
          const updatedChat = prevChat.map((item) => {
            if (item.id === id) {
              let myrobot = "Sorry, I can't answer your question.";
              let mydoc: any = [];
              if (result?.Response) {
                if (result.Response.indexOf("Unfortunately") === -1) {
                  myrobot = result?.Response.replace(/\n\s*\n/g, "\n");
                  if (result.Documentation[0].indexOf("Pages:0") === -1) {
                    mydoc = result.Documentation;
                  } else {
                    const doc = result.Documentation[0].replace("Pages:0", "").trim();
                    mydoc = [doc];
                  }
                }
              }
              return { ...item, robot: myrobot, documentation: mydoc };
            }
            return item;
          });
          return updatedChat;
        });
        setLoadings(false);
      })
      .catch((error) => {
        setError(`apiError: ${error.message}`);
      });
  };

  const items: MenuProps["items"] = [
    {
      label: "ChatBot",
      key: "home",
      icon: <CommentOutlined />,
      disabled: false,
    },
    {
      label: "Logout",
      key: "logout",
      icon: <LogoutOutlined />,
      disabled: false,
    },
  ];

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };
  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
    switch (e.key) {
      case "home": {
        router.push({ pathname: "/home" });
        break;
      }
      case "logout": {
        handleLogout();
        break;
      }
      default:
        console.log("default");
    }
  };

  const handleSwitch = () => {
    setSelected(!selected);
  };

  const ItemDiplay: React.FC<{ item: ChatMessageType }> = ({ item }) => {
    return (
      <div>
        {item?.user ? (
          <div className={styles.blueText}>
            <UserOutlined />: &emsp;
            {item.user}
          </div>
        ) : (
          <></>
        )}
        {item?.robot ? (
          <div>
            <div className={styles.responseText} style={{ whiteSpace: "pre-line" }}>
              <AndroidOutlined />: &emsp;
              {item.robot}
            </div>
            <div>
              {item?.documentation.length > 0 ? (
                <>
                  <Divider style={{ fontSize: "0.7rem", margin: "0 0", color: "#adadad" }} dashed orientation="left">
                    Documentations
                  </Divider>

                  <div className={styles.docText} style={{ whiteSpace: "pre-line" }}>
                    {item.documentation.map((item, index) => (
                      <div key={index} className={styles.docItem}>
                        {item}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    );
  };

  return (
    <div className={styles.fontHelvetica}>
      {displayError ? (
        <div>
          <p>{displayError}</p>
        </div>
      ) : (
        <>
          <div className={styles.total}>
            <div>
              {isMobile ? (
                <>
                  <div className={styles.rightAlignButton}>
                    <Button icon={<LogoutOutlined />} onClick={handleLogout} size="large">
                      Logout
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.header}>
                    <div className={styles._left}>
                      <div>
                        <Image src={ChatbotLogo} className={styles.logo} alt="" priority />
                      </div>
                    </div>
                    <div className={styles._right}>
                      <Menu onClick={onClick} mode="horizontal" items={items} className={styles.menu} />
                    </div>
                  </div>
                </>
              )}
              <Divider />
              <div className={styles.chatInterface}>
                <div style={{ padding: "1rem 0 1rem 0" }}>
                  <Flex vertical={false} style={{ width: "100%" }}>
                    <div>&thinsp;&thinsp;</div>
                    <div
                      onClick={handleSwitch}
                      style={{
                        display: "flex",
                        width: "18.625rem",
                        height: "2rem",
                        borderRadius: "1.3125rem",
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                    >
                      {" "}
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: selected ? "#E5F5FC" : "#009BDE",
                          color: selected ? "#2E3336" : "black",
                          transition: "background-color 0.3s",
                        }}
                      >
                        <div style={{ fontWeight: "500", fontSize: "1rem", color: "#2E3336" }}>Not History Mode</div>
                      </div>
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: selected ? "#009BDE" : "#E5F5FC",
                          color: selected ? "#2E3336" : "white",
                          transition: "background-color 0.3s, color 0.3s",
                        }}
                      >
                        <div style={{ fontWeight: "500", fontSize: "1rem", color: "#2E3336" }}>Remember History</div>
                      </div>
                    </div>
                  </Flex>
                </div>
                {chat.length > 0 ? (
                  <div>
                    {isMobile ? (
                      <>
                        <Content style={{ padding: "1rem", maxHeight: "200vh" }}>
                          <div ref={chatContainerRef} style={{ maxHeight: "180vh", overflowY: "scroll" }}>
                            <List
                              itemLayout="horizontal"
                              dataSource={chat}
                              renderItem={(item) => (
                                <List.Item>
                                  <List.Item.Meta avatar={<Avatar icon={<CommentOutlined />} />} title="" description={<ItemDiplay item={item} />} />
                                </List.Item>
                              )}
                            />
                          </div>
                        </Content>
                      </>
                    ) : (
                      <>
                        <Content style={{ padding: "1rem", maxHeight: "100vh" }}>
                          <div ref={chatContainerRef} style={{ maxHeight: "70vh", overflowY: "scroll" }}>
                            <List
                              itemLayout="horizontal"
                              dataSource={chat}
                              renderItem={(item) => (
                                <List.Item>
                                  <List.Item.Meta avatar={<Avatar icon={<CommentOutlined />} />} title="" description={<ItemDiplay item={item} />} />
                                </List.Item>
                              )}
                            />
                          </div>
                        </Content>
                      </>
                    )}
                  </div>
                ) : (
                  <div>&emsp;</div>
                )}
                <div style={{ padding: "0 0 0 1rem" }}>
                  <Space direction="vertical">
                    <Space.Compact>
                      <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your question..." className={styles.inPut} />
                      <Button type="primary" onClick={() => handleSendMessage(message)} loading={loadings}>
                        Submit
                      </Button>
                    </Space.Compact>
                  </Space>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { io } from 'socket.io-client'; // Using standard socket.io-client
import { useTransactions } from '../../hooks/transactions';

const BACKEND_URL = 'http://localhost:3007';

interface EmployeeSidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onLoginSuccess?: (user: any) => void;
}

export default function EmployeeSidebar({ isOpen, toggleSidebar, onLoginSuccess }: EmployeeSidebarProps) {
  const [currentView, setCurrentView] = useState<"login" | "dashboard" | "chat" | "paystubs">("login");
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [loginError, setLoginError] = useState("");
  const [password, setPassword] = useState("");
  const [loadingChat, setLoadingChat] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  const { transactions, loading, error, fetchTransactions } = useTransactions();
  
  // Handle Chat History & Socket Connection
  useEffect(() => {
    let newSocket: any;

    if (currentView === "chat") {
      setLoadingChat(true);
      
      // 1. Fetch preloaded messages
      fetch(`${BACKEND_URL}/chat/history`)
        .then(res => res.json())
        .then(data => {
          const formattedMessages = data.map((msg: any) => ({
            id: msg.textid,
            text: msg.text,
            sender: msg.userid === parseInt(employeeId) ? "You" : msg.firstname
          }));
          setMessages(formattedMessages);
        })
        .catch(err => console.error("Error fetching history:", err))
        .finally(() => setLoadingChat(false));

      // 2. Connect socket for real-time messages
      newSocket = io(BACKEND_URL, { transports: ['websocket'] });
      setSocket(newSocket);

      newSocket.on('receive_message', (newMessage: any) => {
        setMessages(prev => [...prev, {
          id: newMessage.textid || Date.now(),
          text: newMessage.text,
          sender: newMessage.userid === parseInt(employeeId) ? "You" : (newMessage.firstname || "Team Member")
        }]);
      });
    }

    // Cleanup socket when leaving the chat view
    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, [currentView, employeeId]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && socket) {
      // Send message to the backend via socket
      socket.emit('send_message', { 
        userId: parseInt(employeeId), 
        text: inputText 
      });
      setInputText("");
    }
  };
  
  const handleLogin = async () => {
    setLoginError("");

    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: employeeId,
          password: password,
        }),
      });

      if (!response.ok) {
        setLoginError(`Backend returned Error ${response.status}.`);
        return; 
      }

      const data = await response.json();

      if (data.user) {
        if (onLoginSuccess) onLoginSuccess(data.user);
        setCurrentView("dashboard");
      } else {
        setLoginError(data.message || "Invalid credentials");
      }
    } catch (error) {
      setLoginError("Cannot connect to backend.");
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full w-80 bg-white border-r border-slate-200 shadow-2xl z-40 transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-12 top-1/2 -translate-y-1/2 bg-slate-900 text-white w-12 h-20 rounded-r-xl flex items-center justify-center shadow-lg hover:bg-slate-800 transition-colors border border-l-0 border-slate-800"
      >
        <span className="font-bold text-lg">{isOpen ? "◀" : "▶"}</span>
      </button>

      <div className="flex-1 overflow-y-auto w-full">
        
        {/* VIEW 1: LOGIN */}
        {currentView === "login" && (
          <div className="p-6 pt-12 flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">Employee Portal</h2>
            {loginError && <p className="text-red-500 text-sm mb-4 font-medium">{loginError}</p>}
            <input 
              className="border border-slate-300 rounded-lg p-3 mb-4 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" 
              placeholder="Employee ID" 
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            />
            <input 
              className="border border-slate-300 rounded-lg p-3 mb-6 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" 
              placeholder="Password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              className="bg-slate-900 rounded-lg p-3 w-full text-white font-semibold hover:bg-slate-800 transition-colors"
              onClick={handleLogin}
            >
              Log In
            </button>
          </div>
        )}

        {/* VIEW 2: DASHBOARD */}
        {currentView === "dashboard" && (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-slate-200 pt-12">
              <h2 className="text-2xl font-bold text-slate-900">Portal</h2>
              <p className="text-slate-500 mt-1 text-sm">Logged in successfully</p>
            </div>
            
            <div className="p-4 flex-1 flex flex-col gap-3">
              <button 
                className="bg-white border border-slate-200 rounded-lg p-4 text-left shadow-sm hover:bg-slate-50 text-sm font-semibold text-slate-700" 
                onClick={() => {
                  fetchTransactions(parseInt(employeeId));
                  setCurrentView("paystubs");
                }}
              >
                View Paystubs
              </button>
              <button className="bg-white border border-slate-200 rounded-lg p-4 text-left shadow-sm hover:bg-slate-50 text-sm font-semibold text-slate-700">
                Request Time Off
              </button>
              <button 
                className="bg-slate-900 text-white rounded-lg p-4 text-left shadow-sm hover:bg-slate-800 text-sm font-bold"
                onClick={() => setCurrentView("chat")}
              >
                Open Team Chat
              </button>
            </div>

            <div className="p-6 border-t border-slate-200">
              <button onClick={() => setCurrentView("login")} className="text-red-500 font-semibold text-sm w-full text-center hover:underline">
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* VIEW 3: PAYSTUBS (Unchanged) */}
        {currentView === "paystubs" && (
           <div className="flex flex-col h-full">
           <div className="p-4 pt-8 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
             <h2 className="text-lg font-bold text-slate-900">Paystubs</h2>
             <button onClick={() => setCurrentView("dashboard")} className="text-slate-500 hover:text-slate-800 font-medium text-sm">
               Back
             </button>
           </div>

           <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-3">
             {loading && <p className="text-sm text-slate-500 text-center mt-4">Loading transactions...</p>}
             {error && <p className="text-sm text-red-500 text-center mt-4">{error}</p>}
             {!loading && !error && transactions.length === 0 && (
               <p className="text-sm text-slate-500 text-center mt-4">No paystubs found.</p>
             )}
             
             {!loading && transactions.map((tx: any) => (
               <div key={tx.transactionid} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col gap-1">
                 <div className="flex justify-between items-start">
                   <span className="font-bold text-slate-800 text-sm">{tx.description}</span>
                   <span className="font-bold text-slate-900">${parseFloat(tx.amount).toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between items-center mt-1">
                   <span className="text-xs text-slate-500">
                     {new Date(tx.transactiondate).toLocaleDateString()}
                   </span>
                   <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-1 rounded">
                     {tx.categoryname || "Deposit"}
                   </span>
                 </div>
               </div>
             ))}
           </div>
         </div>
        )}

        {/* VIEW 4: CHAT */}
        {currentView === "chat" && (
          <div className="flex flex-col h-full">
            <div className="p-4 pt-8 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-slate-900">Team Chat</h2>
              <button onClick={() => setCurrentView("dashboard")} className="text-slate-500 hover:text-slate-800 font-medium text-sm">
                Back
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-4">
              {loadingChat ? (
                <p className="text-sm text-slate-500 text-center mt-4">Loading messages...</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === "You" ? "self-end items-end" : "self-start items-start"}`}>
                    <span className="text-[10px] text-slate-400 mb-1 px-1">{msg.sender}</span>
                    <div className={`rounded-xl p-3 text-sm shadow-sm ${msg.sender === "You" ? "bg-slate-900 text-white" : "bg-white text-slate-800 border border-slate-200"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-slate-200 bg-white flex gap-2">
              <input 
                className="flex-1 border border-slate-300 rounded-lg p-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400" 
                placeholder="Type..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button type="submit" className="bg-slate-900 px-4 py-2 rounded-lg text-white font-semibold text-sm hover:bg-slate-800">
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
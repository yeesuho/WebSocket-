let currentUser = null;
let socket;

const authContainer = document.getElementById('auth_container');
const authForm = document.getElementById('auth_form');
const usernameInput = document.getElementById('auth_username');
const passwordInput = document.getElementById('auth_password');
const authButton = document.getElementById('auth_button');
const authError = document.getElementById('auth_error');
const loginTab = document.getElementById('login_tab');
const signupTab = document.getElementById('signup_tab');

const chatApp = document.getElementById('chat_app');
const chatBox = document.getElementById('chat_container');
const messageInput = document.getElementById('message_input');
const sendButton = document.getElementById('send_button');

let isSignupMode = false;

// 탭 전환
loginTab.onclick = () => switchMode(false);
signupTab.onclick = () => switchMode(true);

function switchMode(signup) {
  isSignupMode = signup;
  loginTab.classList.toggle('active', !signup);
  signupTab.classList.toggle('active', signup);
  authButton.textContent = signup ? '가입하기' : '로그인';
  authError.textContent = '';
}

// 로그인/회원가입 처리
authForm.onsubmit = (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) return;

  const users = JSON.parse(localStorage.getItem('users') || '{}');

  if (isSignupMode) {
    if (users[username]) {
      authError.textContent = '이미 존재하는 아이디입니다.';
      return;
    }
    users[username] = password;
    localStorage.setItem('users', JSON.stringify(users));
    alert('회원가입 완료! 이제 로그인해주세요.');
    switchMode(false);
  } else {
    if (!users[username] || users[username] !== password) {
      authError.textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
      return;
    }
    currentUser = username;
    startChat();
  }
};

// 채팅 시작
function startChat() {
  authContainer.style.display = 'none';
  chatApp.style.display = 'flex';
  messageInput.focus();

  socket = new WebSocket('ws://localhost:3000');

  socket.addEventListener('message', async (event) => {
    let data;
    if (event.data instanceof Blob) {
      data = JSON.parse(await event.data.text());
    } else {
      data = JSON.parse(event.data);
    }
    renderMessage(data);
  });
}

// 메시지 전송
function sendMessage() {
  const message = messageInput.value.trim();
  if (!message || !currentUser) return;

  const data = { name: currentUser, message };
  socket.send(JSON.stringify(data));
  messageInput.value = '';
}

// 메시지 출력
function renderMessage({ name, message }) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('message_wrapper', name === currentUser ? 'mine' : 'other');

  if (name !== currentUser) {
    const nameTag = document.createElement('div');
    nameTag.classList.add('name');
    nameTag.textContent = name;
    wrapper.appendChild(nameTag);
  }

  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', name === currentUser ? 'mine' : 'other');
  msgDiv.textContent = message;
  wrapper.appendChild(msgDiv);

  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') sendMessage();
});

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDY2qQHODhC5lPN8ybWk4VoCg-ivOMiYrE",
  authDomain: "challenge-59258.firebaseapp.com",
  projectId: "challenge-59258",
  storageBucket: "challenge-59258.firebasestorage.app",
  messagingSenderId: "1035301361775",
  appId: "1:1035301361775:web:e5b29b735dd95d23c1559a",
  measurementId: "G-27VD3GZ7CT"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function sha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function showStep(step) {
  for (let i = 1; i <= 4; i++) {
    document.getElementById("step" + i).style.display = (i === step ? "block" : "none");
  }
}

window.nextStep = async function(step) {
  if (step === 2) {
    const nameValue = document.getElementById("username").value.trim();
    const pwValue = document.getElementById("password").value.trim();

    if (!nameValue || !pwValue) {
      alert("名前とパスワードを入力してください");
      return;
    }

    const docRef = doc(db, "answers", nameValue);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      alert("ユーザーが存在しません");
      return;
    }

    const data = docSnap.data();
    const hashedInput = await sha256(pwValue);

    if (data.password !== hashedInput) {
      alert("パスワードが違います");
      return;
    }
  }
  showStep(step);
};


window.prevStep = function(step) { showStep(step); };

function populateSelects(prefix) {
  for (let i = 1; i <= 3; i++) {
    const select = document.getElementById(`${prefix}-${i}`);
    select.innerHTML = '<option value="">選択してください</option>';
    for (let n = 1; n <= 14; n++) {
      select.innerHTML += `<option value="${n}">${i}番目: ${n}</option>`;
    }
  }
}

window.validateSet1 = function() {
  const set1 = [
    document.getElementById("set1-1").value,
    document.getElementById("set1-2").value,
    document.getElementById("set1-3").value
  ];
  if (set1.includes("")) { alert("すべての項目を選択してください"); return; }
  if (new Set(set1).size !== set1.length) { alert("同じ数字を複数して選ぶことはできません"); return; }
  nextStep(3);
};

window.submitAnswer = async function() {
  const name = document.getElementById("nameInput").value.trim();
  const set1 = [
    document.getElementById("set1-1").value,
    document.getElementById("set1-2").value,
    document.getElementById("set1-3").value
  ];
  const set2 = [
    document.getElementById("set2-1").value,
    document.getElementById("set2-2").value,
    document.getElementById("set2-3").value
  ];

  if (!name || set1.includes("") || set2.includes("")) { alert("すべての項目を入力してください"); return; }
  if (new Set(set1).size !== set1.length || new Set(set2).size !== set2.length) {
    alert("同じ数字を複数して選ぶことはできません"); return;
  }

  try {
    await setDoc(doc(db, "answers", name), {
      set1, set2,
      createdAt: serverTimestamp()
    });
    showStep(4);
  } catch (e) {
    console.error("保存に失敗:", e);
    alert("エラーが発生しました");
  }
};

// 初期化
window.addEventListener("DOMContentLoaded", () => {
  showStep(1);
  populateSelects("set1");
  populateSelects("set2");
});

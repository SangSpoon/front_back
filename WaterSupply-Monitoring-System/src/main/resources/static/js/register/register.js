
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
    name: form.name.value,
    loginId: form.loginId.value,
    password: form.password.value,
    gender: form.gender.value,
    company: form.company.value,
    dateOfBirth: form.dateOfBirth.value
};

    try {
    const response = await fetch('/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
});

    if (!response.ok) {
    const result = await response.json();
    alert("회원가입 실패: " + (result.error || "알 수 없는 오류"));
    return;
}

    alert("회원가입 성공!");
    // 성공 시 리다이렉트 등 원하는 동작 수행
    window.location.href = 'member/login';

} catch (err) {
    alert("서버와 통신 중 오류가 발생했습니다.");
}
});


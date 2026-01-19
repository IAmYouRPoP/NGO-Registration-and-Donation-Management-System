const BASE_URL = "http://localhost:5000/api/users";

export const getProfile = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

export const updateBloodGroup = async (blood_group) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/update-blood-group`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ blood_group }),
  });

  return res.json();
};

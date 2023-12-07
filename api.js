const addDeal = async (accessToken, data) => {
  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
  const response = await fetch(
    "https://api.pipedrive.com/v1/deals",
    requestOptions
  );
  const dataDeal = await response.json();
  return dataDeal;
};

const getUser = async (accessToken) => {
  const requestOptions = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const response = await fetch(
    "https://api.pipedrive.com/v1/users/me",
    requestOptions
  );
  const dataUser = await response.json();

  return dataUser;
};

module.exports = {
  addDeal,
  getUser,
};

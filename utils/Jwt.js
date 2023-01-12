
const sendJWT = async (user, req, res) => {
    const token = user.getJWTtoken();

    await res.cookie('backendToken', token);
    const { backendToken } = await req.cookies;
    res.status(200).json({ success: true, user, token, backendToken });
}

module.exports = sendJWT;

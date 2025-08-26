import bcrypt from 'bcrypt';

const password = 'Benbridgenstudio44';

const hashPassword = async () => {
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
};

hashPassword();
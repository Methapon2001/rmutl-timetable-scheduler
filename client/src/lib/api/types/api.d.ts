declare namespace API {
  type Session = {
    token: {
      access: string;
      refresh: string;
    };
    user: {
      id: string;
      username: string;
      role: string;
      createdAt: string;
      updatedAt: string;
      jti: string;
      iat: number;
      exp: number;
    };
  };
}

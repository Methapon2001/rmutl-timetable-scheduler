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
      jti: string;
      iat: number;
      exp: number;
    };
  };

  type User = {
    id: string;
    username: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };

  type Subject = {
    id: string;
    code: string;
    name: string;
    credit: number;
    lecture: number;
    lab: number;
    exam: number;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };
}

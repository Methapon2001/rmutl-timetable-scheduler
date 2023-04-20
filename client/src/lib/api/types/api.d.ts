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

  type Instructor = {
    id: string;
    name: string;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Building = {
    id: string;
    code: string;
    name: string;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Room = {
    id: string;
    type: string;
    name: string;
    building: Omit<API.Building, 'createdAt' | 'createdByUserId' | 'updatedAt' | 'updatedByUserId'>;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Course = {
    id: string;
    name: string;
    detail: {
      subject: Omit<API.Subject, 'createdAt' | 'createdByUserId' | 'updatedAt' | 'updatedByUserId'>;
      type: string;
    }[];
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Group = {
    id: string;
    name: string;
    course: Omit<API.Course, 'createdAt' | 'createdByUserId' | 'updatedAt' | 'updatedByUserId'>;
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };

  type Section = {
    id: string;
    no: number;
    lab: number;
    type: string;
    group: Omit<API.Group, 'createdAt' | 'createdByUserId' | 'updatedAt' | 'updatedByUserId'>;
    room: Omit<API.Room, 'createdAt' | 'createdByUserId' | 'updatedAt' | 'updatedByUserId'>;
    subject: Omit<API.Subject, 'createdAt' | 'createdByUserId' | 'updatedAt' | 'updatedByUserId'>;
    instructor: Omit<
      API.Instructor,
      'createdAt' | 'createdByUserId' | 'updatedAt' | 'updatedByUserId'
    >[];
    child: Omit<
      API.Section,
      'child' | 'createdAt' | 'createdByUserId' | 'updatedAt' | 'updatedByUserId'
    >[];
    createdAt: string;
    createdBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
    updatedAt: string;
    updatedBy: Omit<API.User, 'createdAt' | 'updatedAt'>;
  };
}

/**
{
  "data": {
    "id": "CgQFQ2JGXiMnBtEg",
    "no": 1,
    "lab": 1,
    "type": "lab",
    "group": {
      "id": "-HJDFUVoA9QgttZL",
      "name": "CE60",
      "course": {
        "id": "iHKN0IyVhgcLUI3-",
        "name": "CE60",
        "detail": [
          {
            "id": "-dV9rM30hGWeU4OY",
            "type": "compulsory",
            "subject": {
              "id": "YF3laAooQX6rLiKK",
              "code": "ENGCE201",
              "name": "Web Programming 1",
              "credit": 3,
              "lecture": 2,
              "lab": 3,
              "exam": 2
            }
          }
        ]
      }
    },
    "room": {
      "id": "owsxb2iNZduYmW6S",
      "name": "101",
      "type": "lab",
      "building": {
        "id": "jv26d81rm-viIOow",
        "code": "TC1",
        "name": "Technic Computer 1"
      }
    },
    "subject": {
      "id": "xQZm_Hw1OHUOCBf5",
      "code": "ENGCE102",
      "name": "Computer Programming 2",
      "credit": 3,
      "lecture": 2,
      "lab": 3,
      "exam": 2
    },
    "instructor": [
      {
        "id": "61ob6q0ytKwzgg7y",
        "name": "Methapon Metanipat"
      }
    ],
    "child": [],
    "createdAt": "2023-04-20T02:39:19.325Z",
    "createdBy": {
      "id": "fEowtibHT6dmFBmv",
      "username": "admin",
      "role": "admin"
    },
    "updatedAt": "2023-04-20T02:40:56.171Z",
    "updatedBy": {
      "id": "fEowtibHT6dmFBmv",
      "username": "admin",
      "role": "admin"
    }
  }
}
 */

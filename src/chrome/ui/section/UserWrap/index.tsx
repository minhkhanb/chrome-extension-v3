import React from 'react';

interface UserWrapProps {
  search: string;
}

const UserWrap: React.FunctionComponent<UserWrapProps> = ({search}) => {
  return (
    <div>User Wrap search is: {search}</div>
  );
};

export default UserWrap;
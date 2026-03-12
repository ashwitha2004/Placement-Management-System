const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900 text-white">
      <div className="min-h-screen backdrop-blur-[2px]">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;

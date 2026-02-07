import { NavLink } from 'react-router-dom'

export default function TabBar() {
  return (
    <div className="tabbar">
      <NavLink to="/">主页</NavLink>
      <NavLink to="/skills">技能</NavLink>
      <NavLink to="/enhance">强化</NavLink>
      <NavLink to="/codex">图鉴</NavLink>
    </div>
  )
}

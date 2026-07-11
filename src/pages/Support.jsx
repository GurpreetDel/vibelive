import { DMThread } from './Inbox.jsx'
import { PageHead } from './Backpack.jsx'

export default function Support() {
  return (
    <div className="page support">
      <PageHead
        title="🤖 Online Service"
        sub="24×7 service bot — Account · Live · Top up · Privileges · Settings · Functionalities & Currency"
      />
      <div className="support-note">
        Ask anything — e.g. <i>"did my coins come?"</i>, <i>"how to go live"</i>, <i>"what is SVIP"</i>,
        <i>"beans vs coins"</i>. The bot reads your real wallet & recharge history to answer.
      </div>
      <DMThread cid="bot" embedded />
    </div>
  )
}

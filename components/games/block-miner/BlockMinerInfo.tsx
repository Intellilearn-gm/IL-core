import styles from './blockMiner.module.css'

export function BlockMinerInfo() {
  return (
    <div className={styles.info}>
      <p>
        Use the <strong>Left</strong> and <strong>Right</strong> arrow keys to
        move your bucket and collect falling coins.
      </p>
      <p>
        Every coin collected reveals a fun fact about Web3, Educhain, or
        blockchain!
      </p>
    </div>
  )
}

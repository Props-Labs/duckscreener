import throng from 'throng';

const start = async (id: number) => {
  console.log(`Worker ${id} started`);
  const { ReadonlyMiraAmm } = await import('mira-dex-ts');
  console.log("MiraAmm class:", ReadonlyMiraAmm);
  const miraAmm = new ReadonlyMiraAmm();
  console.log("MiraAmm instance created:", miraAmm);
};

const workers = 1;
throng({ workers, start });
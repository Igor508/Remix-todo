import prisma from "../db.server"
export const getList = async() => {
  const list = await prisma.List.findMany({
    orderBy: {
      id: 'asc',
    }
  })
  return { list }
}

export const createList = async(data) => {
  const newList =  await prisma.List.create({
    data: {
      title: data.title,
      content: data.content
    }
  })
  return { newList, status: 201 }
}

export const deleteList = async(data) => {
  let idNumberArray = data.id.split(',').map(Number);
  const deleteList = await prisma.List.deleteMany({
    where: {
      id: {
        in: idNumberArray
      },
    },
  })
  return { deleteList, status: 200 }
}

export const updateList = async(data) => {
  const updateList = await prisma.List.update({
    where: {
      id: parseInt(data.id),
    },
    data: {
      title: data.title,
      content: data.content
    },
  })
  return { updateList, status: 200 }
}
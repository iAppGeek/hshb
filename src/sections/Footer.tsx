import Image from 'next/image'

import { GridPattern } from '@/components/GridPattern'
import github from '@/images/icons/github-mark.svg'

export function Footer() {
  return (
    <footer className="relative pb-20 pt-5 sm:pb-32 sm:pt-14">
      <div className="absolute inset-x-0 top-0 h-32 text-slate-900/10 [mask-image:linear-gradient(white,transparent)]">
        <GridPattern x="50%" />
      </div>
      <div className="relative flex flex-col items-center justify-center text-sm text-slate-600">
        <p>Copyright &copy; {new Date().getFullYear()} Anthony Ladas</p>

        <a
          href="https://github.com/iAppGeek/hshb"
          target="_blank"
          className="flex gap-1 rounded-md px-2 py-1 hover:bg-gray-400 hover:text-white"
          title="Contribute to our website!"
        >
          <Image priority src={github} height={24} alt="Github Link" />
          <span>Contribute</span>
        </a>

        <p>All rights reserved.</p>
        <p>
          Socials icons by{' '}
          <a
            target="_blank"
            href="https://icons8.com"
            className="rounded-md px-1 py-1 hover:bg-gray-400 hover:text-white"
          >
            Icons8
          </a>
        </p>
      </div>
    </footer>
  )
}
